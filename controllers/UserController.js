class UserController{

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onsubmit();
        this.onEdit();
        this.selectAll();
    }

    // Volta do formulário de update de usuário para o de create novo usuário
    onEdit(){

        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e=>{
            this.showPanelCreate();
        })

        this.formUpdateEl.addEventListener('submit', event=>{
        
            event.preventDefault();

            let btn = this.formEl.querySelector('[type=submit]');
            let values = this.getValues(this.formUpdateEl);

            if (!values) return false;

            btn.disabled = true;

            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, userOld, values);

            this.showPanelCreate();

            this.getPhoto(this.formUpdateEl).then(
                (content)=>{  

                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else{
                        result._photo = content;
                    }

                    let user = new User();
                    user.loadFromJSON(result);

                    user.save();

                    this.getTr(user, tr);
                    
                    this.formUpdateEl.reset();

                    btn.disabled = false;

                    this.updateCount();

                },
                (e)=>{

                    console.error(e);

                }
            );

        });
    }

    // Define o evento de submit para o botão de salvar
    onsubmit(){

        let _this = this;

        this.formEl.addEventListener('submit', function(event){

            event.preventDefault(); // seta defaul no evento padrão 
            
            let btn = _this.formEl.querySelector('[type=submit]');

            let values = _this.getValues(_this.formEl);

            if (!values) return false;

            btn.disabled = true;

            values.photo = '';
            _this.getPhoto(_this.formEl).then(
                (content)=>{  

                    values.photo = content;
                    
                    values.save();

                    _this.addLine(values);

                    _this.formEl.reset();
                    btn.disabled = false;

                },
                (e)=>{

                    console.error(e);

                }
            );

        
        });

    }


    // Método que transforma a imagem enviada em base64
    getPhoto(formEl){
        
        return new Promise((resolve, reject) =>{

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item=>{
                
                if (item.name === 'photo'){
                    return item
                }

            });

            let file = elements[0].files[0];

            fileReader.onload = ()=>{
                
                resolve(fileReader.result);

            };

            fileReader.onerror = ()=>{
                reject(e);
            }

            if (file){
                fileReader.readAsDataURL(file);
            } else{
                resolve('dist/img/boxed-bg.jpg');
            }
            

        });
        
    }


    // Pega os valores contidos nos campos do formulario
    getValues(formEl){

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;

            }

            if (field.name == 'gender'){
        
                if (field.checked) user.gender = field.value;
        
            } else if(field.name == 'admin'){

                user[field.name] = field.checked;

            } else{

                user[field.name] = field.value;

            }
        
            
        
        });

        if (!isValid) return false;
    
        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin
        );

    }


/*     
    insert(data){
        
        let users = this.getUsersStorage();
        users.push(data);

        //sessionStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('users', JSON.stringify(users));
    }
*/
    
    selectAll(){
        let users = User.getUsersStorage();

        users.forEach(dataUser =>{

            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);

        })
    }

    // Add linha na tabela dos usuários
    addLine(dataUser){
        
        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);
        
        this.updateCount();

    }

    getTr(dataUser, tr=null){
        
        if (!tr) tr = document.createElement('tr');
        
        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML =`
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin)?'Sim':'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventTr(tr);
        return tr;
    }

    addEventTr(tr){

        tr.querySelector('.btn-delete').addEventListener('click', e=>{

            if (confirm('Deseja realmente excluir?')){

                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove();

                tr.remove();
                this.updateCount();
            }

        });

        tr.querySelector('.btn-edit').addEventListener('click', e=>{
            
            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json){

                let field = this.formUpdateEl.querySelector('[name='+name.replace('_','')+']');
                
                if (field) {
                    
                    switch (field.type){

                        case 'file':
                            continue;
                        break;
                        case 'radio':
                            field = this.formUpdateEl.querySelector('[name='+name.replace('_','')+'][value='+json[name]+']');
                            field.checked = true;
                        break;
                        case 'checkbox':
                            field.checked = json[name];
                        break;
                        default:  
                            field.value = json[name];

                    }
                     
                }

            }

            this.formUpdateEl.querySelector('.photo').src = json._photo;

            this.showPanelUpdate();

        });

    }

    showPanelCreate(){
        document.querySelector('#box-user-create').style.display = 'block';
        document.querySelector('#box-user-update').style.display = 'none';
    }

    showPanelUpdate(){
        document.querySelector('#box-user-create').style.display = 'none';
        document.querySelector('#box-user-update').style.display = 'block';
    }

    updateCount(){
        let numberUser = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberUser++;

            if (JSON.parse(tr.dataset.user)._admin) numberAdmin++;

        });

        document.querySelector('#number-users').innerHTML = numberUser;
        document.querySelector('#number-users-admin').innerHTML = numberAdmin;
    }

}