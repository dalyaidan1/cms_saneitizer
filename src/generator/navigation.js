class Navigation{
    constructor(){
        this.navArray = []
    }

    append(element){
        this.navArray.push(element)
    }

    get(){
        return this.navArray
    }

    clear(){
        this.navArray = []
    }
}

module.exports = Navigation