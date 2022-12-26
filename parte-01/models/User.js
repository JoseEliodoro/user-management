class User {

    constructor(name, gender, birth, country, email, password, photo, admin){

        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();

    }

    get id(){
        return this._id;
    }

    get register(){
        return this._register;
    }

    get name(){
        return this._name;
    }
    
    get gender(){
        return this._gender;
    }

    get birth(){
        return this._birth;
    }

    get country(){
        return this._country;
    }

    get email(){
        return this._email;
    }

    get password(){
        return this._password;
    }

    get photo(){
        return this._photo;
    }

    set photo(value){
        this._photo = value;
    }

    get admin(){
        return this._admin;
    }

    getNewID(){

        let usersID = parseInt(localStorage.getItem('usersID'))
        if (!usersID > 0) usersID = 0;
        
        usersID++;

        localStorage.setItem('usersID', usersID);

        return usersID;

    }

    loadFromJSON(json){

        for (let name in json){

            if (name == '_register'){
                this[name] = new Date(json[name]);
            } else{
                
                this[name] = json[name]
            }

        }

    }

    save(){
             
        let users = User.getUsersStorage();
        
        if (this.id > 0){

            users = users.map(u=>{      
                if (u._id == this.id){
                    u = this;
                }
                return u;

            });

        } else{
            this._id = this.getNewID();

            users.push(this);
            
        }
        localStorage.setItem('users', JSON.stringify(users));


    }

    static getUsersStorage(){
        let users = [];
          //sessionStorage.getItem('users')
        if (localStorage.getItem('users')){
            users = JSON.parse(localStorage.getItem('users'));
            //users = JSON.parse(sessionStorage.getItem('users'));
        }

        return users
    }

    remove(){
        let users = User.getUsersStorage();
        
        users = users.filter(u=>{return u._id != this.id});
    
        localStorage.setItem('users', JSON.stringify(users));
    }



}