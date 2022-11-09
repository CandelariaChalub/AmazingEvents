const app  = Vue.createApp({ 
    data() {
        return { 
            //propiedades del objeto vue//
            date: "",
            eventos: [],
            copiaEventos: [],
            categories: [],
            detailEvent: {},
            inputSearch: "",
            checkedCategories: [],

            upcomingEvents:[],
            pastEvents: [],

            nombre: "",
            email: "",
            mensaje: "",

            eventsStats: [],
            upcomingStats: [],
            pastStats: [],
        }
    }, 
    created(){
        fetch("https://amazing-events.herokuapp.com/api/events")
        .then(respuesta => respuesta.json()) 
        .then(dataJson => {

            if (document.title == 'Amazing Events'){ 
                this.eventos = dataJson.events
            }

            if (document.title == 'Upcoming Events'){ 
                this.eventos = dataJson.events.filter(evento => evento.date > dataJson.currentDate)
            }

            if (document.title == 'Past Events'){ 
                this.eventos = dataJson.events.filter(evento => evento.date < dataJson.currentDate)
            }

            //relleno la variable de eventos//
            this.copiaEventos = this.eventos 

            //relleno la variable de los checkboxes y hago que no se repitan//
            dataJson.events.forEach(evento => {
                if (!this.categories.includes(evento.category))
                this.categories.push(evento.category)
            });
            
            //filtro de tabla//
            this.upcomingEvents = this.eventos.filter(evento => evento.date > dataJson.currentDate)
            this.pastEvents = this.eventos.filter(evento => evento.date < dataJson.currentDate)
            //tabla con 3 cards//
            this.eventsStats =  this.capacidadAsistencia(this.eventos)
            console.log(this.eventsStats)
            this.upcomingStats = this.filtroPastUpTable(this.upcomingEvents)
            this.pastStats =  this.filtroPastUpTable(this.pastEvents)
            
            //details//
            const queryString = location.search
            const params = new URLSearchParams(queryString)
            const idDetail = params.get("id")
            this.detailEvent = this.eventos.find((evento)=>evento._id === idDetail) //asigno guardo
        })
    }, 
    mounted() {},
	methods: { //donde pongo mis funciones
        //filtro de busqueda//
		searchFilter(arrayEvents){
			this.eventos = arrayEvents.filter(event => event.name.toLowerCase().includes(this.inputSearch.toLowerCase()) || event.description.toLowerCase().includes(this.inputSearch.toLowerCase()))
		},
        mensajeDeAviso(){
            if (this.nombre.length== 0 || this.email.length== 0 || this.mensaje.length== 0){
                Swal.fire(
                    'Error',
                    'You must fill in the fields to send a message',
                    'error'
                )
            } else{
                Swal.fire(
                    'Send',
                    'Your message has been sent successfully',
                    'success'
                )
            }
		},
        capacidadAsistencia (eventos){ //para buscar cuales son los eventos//
            let arrayFiltradoEventos = eventos.filter(evento => evento.assistance != undefined)
        
            let capacidad = eventos.map(evento => evento.capacity)
            let maxCapacidad = Math.max (...capacidad) 
            let eventoMaxCapacidad = eventos.find (evento => evento.capacity==maxCapacidad)
            
            let asistencia = arrayFiltradoEventos.map(evento => (evento.assistance ?evento.assistance : evento.estimate) /evento.capacity)
            let maxAsistencia = Math.max (...asistencia)
            let eventoMaxAsistencia = arrayFiltradoEventos.find (evento => (evento.assistance ?evento.assistance : evento.estimate) /evento.capacity==maxAsistencia)
            
            let minAsistencia = Math.min (...asistencia)
            let eventoMinAsistencia = arrayFiltradoEventos.find (evento => (evento.assistance ?evento.assistance : evento.estimate) /evento.capacity==minAsistencia)
            return [eventoMaxAsistencia, eventoMinAsistencia, eventoMaxCapacidad] 
        },
        filtroPastUpTable (almacenado) {
            let categorias = []
            almacenado.forEach(event => {
            if (!categorias.includes(event.category)) {
                categorias.push(event.category)
            }
        })
        let arrayStats = []
            categorias.forEach(categoria => {
            let primerFiltrado = almacenado.filter(event => event.category == categoria )
            let ganancias = primerFiltrado.map(event => (event.assistance ?event.assistance :event.estimate) * event.price)
            let porcentajeAsistencias = primerFiltrado.map(event => (event.assistance ?event.assistance :event.estimate) / event.capacity)
            let totalGanancias = 0
            let totalAsistenciaCate = 0
            ganancias.forEach(ganancia => 
                totalGanancias += ganancia
            )
            porcentajeAsistencias.forEach(porcentaje => totalAsistenciaCate += porcentaje)
            arrayStats.push([categoria, totalGanancias, (totalAsistenciaCate / primerFiltrado.length)])
        })
        return arrayStats
        }
	},
	computed: { //llamarlas una vez en el html y se van a ejecutar cuando hay un cambio en mi data
		doubleFilter(){
			if(this.checkedCategories.length != 0){
				this.eventos = this.copiaEventos.filter(event => {
					return this.checkedCategories.includes(event.category)
				})
			}else{
				this.eventos = this.copiaEventos
			}
			if(this.inputSearch != ""){
				this.searchFilter(this.eventos)
			}
		}
	},
}).mount('#app')
