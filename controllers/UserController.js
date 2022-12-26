class UserController{

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate); // Parâmetro que representa o formulário de criação de usuário
        this.formUpdateEl = document.getElementById(formIdUpdate); // Parâmetro que representa o formulário de edição de usuário
        this.tableEl = document.getElementById(tableId); // Parâmetro que representa a tabela dos usuários cadastrados

        this.onsubmit();
        this.onEdit();
        this.selectAll();
    }

    // Volta do formulário de update de usuário para o de create novo usuário
    onEdit(){

        // Caso clicar no btn de cancelar volta para o formulário de criação
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e=>{
            this.formUpdateEl.reset();
            this.showPanelCreate();
        });

        // Add do evento de submit do formulário de edição
        this.formUpdateEl.addEventListener('submit', event=>{
            
            event.preventDefault(); // Seta default para o evento

            let btn = this.formEl.querySelector('[type=submit]'); // btn que representa a criação de novos usuários
            
            let values = this.getValues(this.formUpdateEl);

            if (!values) return false; // Caso o values esteja vazio

            btn.disabled = true;// Desabilita o btn de criação

            let index = this.formUpdateEl.dataset.trIndex; // Extraindo a posição da tabela que o user está sendo editado
            let tr = this.tableEl.rows[index]; // Pegando a tr que está sendo editada

            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, userOld, values); // Unindo os items anteriores como os editados

            this.showPanelCreate();

            // Chamada de Promesa do método getPhoto
            this.getPhoto(this.formUpdateEl).then(
                (content)=>{  

                    // Caso não tenha adicionado nenhuma foto ira continuar a antiga
                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else{
                        result._photo = content;
                    }

                    
                    let user = new User(); // Criando novo obj User
                    user.loadFromJSON(result); // Carregando dados no obj User

                    user.save(); // Salvando o usuário editado

                    this.getTr(user, tr); // Recolocando informações na tr
                    
                    this.formUpdateEl.reset(); // Reseta o formulário para um novo registro

                    btn.disabled = false; // Habilita o btn de criação

                    this.updateCount();

                },
                (e)=>{

                    console.error(e);

                }
            );

        });
    }

    // Métoo que define o evento de submit para o botão de salvar do formulário de criação
    onsubmit(){

        let _this = this; // Variável para poder enxergar dentro da função

        this.formEl.addEventListener('submit', function(event){ // add do evento de submit

            event.preventDefault(); // Seta default para o evento
            
            let btn = _this.formEl.querySelector('[type=submit]'); // btn que representa a criação de novos usuários

            let values = _this.getValues(_this.formEl); 

            if (!values) return false; // Caso o values esteja vázio

            btn.disabled = true; // Desabilita o btn de criação
            
            values.photo = '';
            // Chamada de Promesa do método getPhoto
            _this.getPhoto(_this.formEl).then(
                (content)=>{  // parâmetro é a img em base64

                    values.photo = content;
                    
                    values.save();  // Chamada do método que salva o obj

                    _this.addLine(values); // Add o usuário criado na tabela

                    _this.formEl.reset(); // Reseta o formulário para um novo registro
                    btn.disabled = false; // Habilita o btn de criação

                },
                (e)=>{

                    console.error(e);

                }
            );

        
        });

    }


    // Método que transforma a imagem enviada em base64
    getPhoto(formEl){
        
        // Retorna uma promesa
        return new Promise((resolve, reject) =>{

            let fileReader = new FileReader(); // API de leitura de arquivos

            // Procura o campo que contém o name=photo e retorna esse campo
            let elements = [...formEl.elements].filter(item=>{
                
                if (item.name === 'photo'){
                    return item
                }

            });
            
            // Pegando o arquivo
            let file = elements[0].files[0];

            // Carregando a imagem
            fileReader.onload = ()=>{
                
                resolve(fileReader.result);

            };

            fileReader.onerror = ()=>{
                reject(e);
            }

            // Mandando a URL para ser transformado em base64
            if (file){
                fileReader.readAsDataURL(file);
            } else{
                resolve('dist/img/boxed-bg.jpg');
            }
            

        });
        
    }


    // Pega os valores contidos nos campos do formulario
    getValues(formEl){

        let user = {}; // Criando JSON vazío
        let isValid = true;

        // Procurando campos no formulário
        [...formEl.elements].forEach(function(field, index){

            // Caso um dos campos abaixo esteja vazio add a classe has-error no campo
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;

            }

            // Tratamento para campos radioButton
            if (field.name == 'gender'){
        
                if (field.checked) user.gender = field.value;
                
            // Tratamento pra campo de checkbox
            } else if(field.name == 'admin'){

                user[field.name] = field.checked;

            } else{

                user[field.name] = field.value;

            }
        
            
        
        });

        // Não cria novo usuário caso falte algo
        if (!isValid) return false;
        
        // Retorna um novo obj User
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
    
    // Método que carrega usuários na memória
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

    // Método que cria/formata uma tr apartir dos dados inseridos
    getTr(dataUser, tr=null){
        
        if (!tr) tr = document.createElement('tr'); // Caso não seja passado uma tr cria uma nova
        
        tr.dataset.user = JSON.stringify(dataUser); // Inserir o novo dataset na tr

        // Formata a tr
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

        this.addEventTr(tr); // Add os eventos da tr
        return tr;
    }

    // Inserir os eventos de delete e edit na tr
    addEventTr(tr){

        // Evento de excluir o usuário
        tr.querySelector('.btn-delete').addEventListener('click', e=>{

            if (confirm('Deseja realmente excluir?')){

                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove(); // Delete da memória

                tr.remove(); // Remove da tabela
                this.updateCount();
            }

        });

        // Evento de edição
        tr.querySelector('.btn-edit').addEventListener('click', e=>{
            
            let json = JSON.parse(tr.dataset.user); // Extraindo o dataset da tr

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json){

                let field = this.formUpdateEl.querySelector('[name='+name.replace('_','')+']');
                
                // Colocar cada informação da dataset nos seus respectivos campos
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

    // Método que conta a quantidades de usuários e de admin
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