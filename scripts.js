const Modal = {
    toggleModal(){
        const modal = document.querySelector('.modal-overlay')
        Toggle.display(modal)
    },
    toggleReport(){
        const report = document.querySelector('section.modal-report')
        Toggle.display(report)
    }
}

const Toggle = {
    display(element){
        element.classList.toggle('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))   
    }
}


const Transaction = {
    all: Storage.get(),
    add( transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes(){
        let income = 0
        Transaction.all.forEach( tr => {
            if(tr.amount > 0){
                income += tr.amount
            }
        })
        return income;
    },
    expenses(){
        let expense = 0
        Transaction.all.forEach( tr => {
            if(tr.amount < 0){
                expense += tr.amount
            }
        })
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    },
    isEmpty(){
        return (Transaction.all.length === 0)
    }
}

const DOM = {
    emptyVisible: "",
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? 'income': 'expense'
        const amount =  Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html;
    },
    updateBalance(){
         document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency( Transaction.incomes() ) 
        document
            .getElementById('expenseDisplay')
            .innerHTML =  Utils.formatCurrency( Transaction.expenses() ) 
        document
            .getElementById('totalDisplay')
            .innerHTML =  Utils.formatCurrency( Transaction.total() )
    },
    clearTransactions(){
        DOM.transactionContainer.innerHTML = ""
    },
    showEmptyTable(){
        document.
            querySelector('div.empty-table').
            classList.
            toggle('display-empty')
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value)/100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal+value
    },
    formatAmount(amount){
        return Number(amount) * 100
    },
    formatDate(date){
        const splitted = date.split("-")
        return `${splitted[2]}/${splitted[1]}/${splitted[0]}`
    }
}

const Form = {
    desc:   document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date:   document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.desc.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validateFields(){
        const {description, amount, date} = Form.getValues()
        
        if( description.trim() === "" || 
            amount.trim() === "" ||
            date.trim() === ""){
                throw new Error("Por favor, preencha todos os campos")
        }
    },
    formatValues(){
        let {description,amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)
        return{
            description,
            amount,
            date
        }
    },
    saveTransaction( transaction ){
        Transaction.add( transaction )
    },
    clearFields(){
        Form.desc.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
        event.preventDefault()

        try {            
            Form.validateFields()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)           
            Form.clearFields()
            Modal.toggleModal()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach( DOM.addTransaction )
        DOM.updateBalance()
        Storage.set( Transaction.all )    
        if(Transaction.isEmpty()){
            DOM.showEmptyTable()
            DOM.emptyVisible = true;
        }
        else if(DOM.emptyVisible){
            DOM.showEmptyTable()
            DOM.emptyVisible = false;
            
        }
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()