const Modal = {
    toggleModal(){
        const modal = document.querySelector('.modal-overlay')
        Modal.display(modal)
    },
    toggleReport(){
        Report.render()
        const report = document.querySelector('div.modal-report-container')
        Modal.display(report)
    },
    display(element){
        element.classList.toggle('active')
    }
}

const Today = {
    date: new Date(),
    get(){
        return String( Number(Today.date.getMonth())+'/'+Today.date.getFullYear())
    },
    year(){
        return Today.date.getFullYear()
    },
    month(){
        return Today.date.getMonth()
    }
}

const DATE = {
    month: Today.month(),
    year: Today.year(),
    getCurrentDate(){
        return DATE.getMonthName( Number(this.month) )+'/'+DATE.year
    },
    getMonthName(month){
        let names = new Array ("JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ")
        return names[month]
    },
    getFullDate(){
        let names = new Array ("Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
        return names[this.month]+' de '+this.year
    },
    clear( element ){
        element.innerHTML("")
        return element
    },
    previousDate(){
        DATE.month--
        DATE.updateMonth()
        App.reload()
    },
    nextDate(){
        DATE.month++
        DATE.updateMonth()
        App.reload()
    },
    updateMonth(){
        if( DATE.month === 12 ){
            DATE.month = 0
            DATE.year++
        }
        else if( DATE.month === -1){
            DATE.month = 11
            DATE.year--
        }
    },
    updateCalendar(){
        document
        .querySelector('p#calendar-month-year')
        .innerHTML = DATE.getCurrentDate()
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem(`dev.finances:transactions[${DATE.getCurrentDate()}]`)) || []
    },
    set(transactions){
        localStorage.setItem(`dev.finances:transactions[${DATE.getCurrentDate()}]`, JSON.stringify(transactions))   
    },
    getByDate( date){
        return JSON.parse(localStorage.getItem(`dev.finances:transactions[${date}]`)) || []
    },
    setByDate(transactions, date){
        localStorage.setItem(`dev.finances:transactions[${date}]`, JSON.stringify(transactions))   
    }
    
}

const Transaction = {
    values: [0,0],

    getAll(){
        return Storage.get()
    },
    add( transaction){
        let fdate = Utils.formatCalendar( transaction.date )
        console.log(fdate)
        let stg = Storage.getByDate(fdate)
        stg.push(transaction)
        Storage.setByDate( stg, fdate)
        App.reload()
    },
    remove(index){
        const all = Transaction.getAll()
        all.splice(index, 1)
        console.log( all )
        Storage.set(all)
        App.reload()
    },
    incomes(){
        let income = 0
        Transaction.getAll().forEach( tr => {
            if(tr.amount > 0){
                income += tr.amount
            }
        })
        return income;
    },
    expenses(){
        let expense = 0
        Transaction.getAll().forEach( tr => {
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
        return (Transaction.getAll().length === 0)
    },
    count(){
        this.values = [0,0]
        Transaction.getAll().forEach( tr =>{
            ( tr.amount > 0) ? this.values[0]++ : this.values[1]++ 
        })
        return this.values
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),
    emptyTable: document.querySelector('div.empty-table'),

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
                <img onclick="Transaction.remove(${index})" src="./assets/clarity_remove.svg" alt="Remover transação">
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
        DOM.emptyTable.classList.add('display-empty')
    },
    hideEmptyTable(){
        DOM.emptyTable.classList.remove('display-empty')
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
        amount = amount*100
        return Math.round(amount)
    },
    formatDate(date){
        const splitted = date.split("-")
        return `${splitted[2]}/${splitted[1]}/${splitted[0]}`
    },
    formatCalendar(date){
        let fd = date.split('/')
        return DATE.getMonthName( Number(fd[1]-1) )+'/'+fd[2]
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

const Report = {
    dateReport: document.querySelector('h3.full-date-report'),
    countIncomes:  document.querySelector('b.report-incomes'),
    countExpenses: document.querySelector('b.report-expenses'),
    countTotal:    document.querySelector('b.count-total'),
    porcent: [document.querySelector('p.incomes-porc'), document.querySelector('p.expenses-porc')],
    totalIcon: document.querySelector('img#total-icon'),

    render(){
        this.dateReport.innerHTML = DATE.getFullDate()
        this.updateCountLabels()
        this.updatePorc()
        this.updateReportBalance()
        Graph.createPieChart()
    },
    updateCountLabels(){
        const values = Transaction.count()
        this.updateCount(this.countIncomes, values[0])
        this.updateCount(this.countExpenses, values[1])
        this.updateCount(this.countTotal, values[0]+values[1])
    },
    updateCount(element, value){
        element.innerHTML = value
    },
    updatePorc(){
        const values = Transaction.count()
        for(let i=0; i<2; i++){
            let total   = values[0]+values[1]
            let incPorc =  Math.round( (values[i]*100)/total )
            this.updateCount(this.porcent[i], `${incPorc}%`)
        }
    },
    updateReportBalance(){
        document
            .querySelector('p.incomes-total')
            .innerHTML = Utils.formatCurrency( Transaction.incomes() ) 
        document
            .querySelector('p.expenses-total')
            .innerHTML =  Utils.formatCurrency( Transaction.expenses() ) 
        this.updateTotal()
    },
    updateTotal(){
        const total = Transaction.total()
        const label = document.querySelector('b.report-total')
        const like = './assets/like-green.svg'
        const deslike = './assets/dislike-red.svg'
        label.innerHTML =  Utils.formatCurrency( Transaction.total() )
        if(total >= 0){            
            label.classList.add('count-incomes')
            this.totalIcon.src = like
        }else{
            label.classList.add('count-expenses')
            this.totalIcon.src = deslike
        }
    }
}

const Graph = {
    pieCanvas: document.getElementsByClassName('pie-chart'),
    incomesColor: 'rgba(104, 196, 70, 1)',
    expensesColor: 'rgba(230, 78, 116, 1)',
    createPieChart(){
        let incomes  = Transaction.incomes()/100
        let expenses = Transaction.expenses()/100
        this.pieCanvas.innerHTML = ''
        new Chart(this.pieCanvas, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [incomes, expenses],
                    backgroundColor: [
                        Graph.incomesColor,
                        Graph.expensesColor
                    ]
                }],
                labels: [
                    'Entradas',
                    'Saídas'
                ] 
            },
            options:{
                cutoutPercentage: 80
            }
        })
    }
}

const App = {
    init(){
        Storage.getByDate( DATE.getCurrentDate() ).forEach( DOM.addTransaction )
        DOM.updateBalance()
        DATE.updateCalendar()
        Transaction.isEmpty() ? DOM.showEmptyTable() : DOM.hideEmptyTable()
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()