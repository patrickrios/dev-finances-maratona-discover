var ctx = document.getElementsByClassName('chart')

var graph = new Chart(ctx, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [30, 70],
            backgroundColor: [
                'rgba(104, 196, 70, 1)',
                'rgba(230, 78, 116, 1)'
            ]
        }],
        
        labels: [
            'Entradas',
            'Saídas',
        ]
    },
    options:{
        cutoutPercentage: 70
    }
})