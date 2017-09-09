// ==============================
// Data
// ==============================

var data = {
  config: {
    editable: false
  },
  products: [],
  product: {},
  platform: {},
  version: {},
  selected: {
    product: false,
    platform: false,
    version: false
  }
}

var handleError = function(error){
  console.error(error)
}


// ==============================
// Data Base
// ==============================

var api = {
  url: 'http://jinik.com.ar:5000/products'
}

var db = {
  loadProducts: function(){

    $.ajax({
      dataType: "json",
      type: 'GET',
      url: api.url,
      error: handleError,
      success: function(response){
        data.products = [];

        response._items.forEach(function(product){
          product.isActive = false;
          data.products.push( product );
        })

        vm.selectProduct(data.products[0])
      }
    });

  },

  addProduct: function(){
    
    var newProduct = {
      "name" : "En blanco",
      "leaders" : [],
      "externals" : [],
      "info" : {
        "users" : "Sin desarrollar.",
        "need" : "Sin desarrollar.",
        "objetive" : "Sin desarrollar.",
        "message" : "Sin desarrollar.",
        "dependencies" : "Sin desarrollar.",
        "kpis" : []
      },
      "experience" : {
        "initial" : "Sin desarrollar.",
        "expected" : "Sin desarrollar."
      },
      "platforms" : [ 
        {
          "id" : "plataforma",
          "versions" : [ 
            {
              "stories" : [ 
                {
                  "text" : "Sin desarrollar.",
                  "id" : "1"
                }
              ]
            }
          ]
        }
      ]
    };

    console.log(JSON.stringify(newProduct))

    $.ajax({
      dataType: "json",
      contentType: "application/json",
      type: 'POST',
      url: api.url,
      data: JSON.stringify(newProduct),
      error: handleError,
      success: function(response){
        console.log(response)
        db.loadProducts();
      }
    });

  },

  removeProduct: function(id, etag){
    $.ajax({
      dataType: "json",
      type: 'DELETE',
      url: api.url +'/'+ id,
      headers: {
        'If-Match': etag
      },
      error: handleError,
      success: function(response){
        console.log(response)
        db.loadProducts();
      }
    });
  },

  saveChanges: function(){

    editedProduct = data.product;
    delete editedProduct._links;
    delete editedProduct.isActive;

    $.ajax({
      dataType: "json",
      contentType: "application/json",
      type: 'PATCH',
      url: api.url +'/'+ data.product._id,
      data: JSON.stringify(data.product),
      headers: {
        'If-Match': data.product._etag
      },
      error: handleError,
      success: function(response){
        console.log(response)
        console.log('Saved!')
        data.product._etag = response._etag;
        // db.loadProducts();
      }
    });
  }
}


$( document ).ready(function() {
  db.loadProducts();
});


// ==============================
// Vue Components
// ==============================

// Menu element

Vue.component('product-menu', {
  props: ['product', 'config'],
  template:`<li class="nav-item">
              <div class="row">
                <div v-if="config.editable" class="col col-sm-auto pr-0 pt-1">
                  <a href="#" class="text-danger" v-on:click.prevent="remove(product)"><i class="material-icons">delete</i></a>
                </div>
                <div class="col">
                  <a class="nav-link" href="#" v-bind:class="isActive(product)" @click.prevent="select(product)">{{ product.name }}</a>
                </div>
              </div>
            </li>`,
  methods: {
    select: function (product) {
      vm.selectProduct(product)
    },

    remove: function(product){
      vm.removeProduct(product)
    },

    isActive: function(product){
      if(product === data.product){
        return 'active'
      }
    }
  }
})

Vue.component('platform-menu', {
  props: ['platform', 'index', 'config'],
  template:`<div class="btn-group mb-1 mr-1" role="group"> 
              <template v-if="config.editable">
                <a class="btn btn-sm text-white" v-bind:class="isActive(platform)">
                  <editable :content="platform.id" v-on:update="platform.id = $event"></editable>
                </a>
                <a href="#" class="btn btn-danger btn-sm px-1" v-on:click.prevent="remove(index)"><i class="material-icons">delete</i></a>
              </template>
              <a v-else href="#" class="btn btn-sm" v-on:click.prevent="select(platform)" v-bind:class="isActive(platform)">{{ platform.id }}</a>
            </div>`,
  // template: '<li class="nav-item"> <a class="nav-link py-1" v-on:click.prevent="select(platform)" v-bind:class="isActive(platform)" href="#">{{ platform.id }}</a> </li>',
  methods: {
    select: function (platform) {
      vm.selectPlatform(platform)
    },

    remove: function(index){
      vm.removePlatform(index)
    },

    isActive: function(platform){
      if(platform === data.platform){
        return 'btn-primary'
      }else{
        return 'btn-secondary'
      }
    }
  }
})

Vue.component('version-menu', {
  props: ['version', 'index', 'config'],
  template:`<div class="btn-group mb-1 mr-1" role="group">
              <template v-if="config.editable">
                <a class="btn btn-sm text-white" v-bind:class="isActive(index)">{{ index }}</a>
                <a href="#" class="btn btn-danger btn-sm px-1" v-on:click.prevent="remove(index)"><i class="material-icons">delete</i></a>
              </template>
              <a v-else href="#" class="btn btn-sm" v-on:click.prevent="select(index)" v-bind:class="isActive(index)">{{ index }}</a>
            </div>`,
  // template: '<li class="nav-item"> <a class="nav-link py-1" v-on:click.prevent="select(version)" v-bind:class="isActive(version)" href="#">{{ version.id }}</a> </li>',
  methods: {
    select: function (index) {
      vm.selectVersion(index)
    },

    remove: function(index){
      vm.removeVersion(index)
    },

    isActive: function(index){
      if(index === data.selected.version){
        return 'btn-primary'
      }else{
        return 'btn-secondary'
      }
    }
  }
})

Vue.component('editable',{
  template:'<span contenteditable="true" @input="update"></span>',
  props:['content'],
  mounted:function(){
    this.$el.innerText = this.content;
  },
  methods:{
    update:function(event){
      this.$emit('update',event.target.innerText);
      // db.saveChanges()
    }
  }
})

// ==============================
// Vue Instance
// ==============================

var vm = new Vue({
  el: '#app',
  data: data,
  computed: {
  },
  methods: {
    marked: function (text) {
      return marked(text, { sanitize: true })
    },

    selectProduct: function (selected) {
      Vue.set(data.selected, 'product', true)
      Vue.set(data, 'product', selected)
      vm.selectPlatform(selected.platforms[0])
    },

    addProduct: function(){
      db.addProduct()
    },

    removeProduct: function(product){
      db.removeProduct(product._id, product._etag)
    },

    selectPlatform: function (selected) {
      Vue.set(data.selected, 'platform', true)
      Vue.set(data, 'platform', selected)
      vm.selectVersion(selected.versions.length - 1)
    },

    addPlatform: function(){
      data.product.platforms.push({
        id: 'plataforma_nueva',
        versions: [
          {
            stories: []
          }
        ]
      })
      db.saveChanges()
    },

    removePlatform: function(index){
      data.product.platforms.splice(index,1)
      db.saveChanges()
    },

    selectVersion: function (index) {
      Vue.set(data.selected, 'version', index)
      Vue.set(data, 'version', data.platform.versions[index])
    },

    addVersion: function(){
      data.platform.versions.push(data.platform.versions[ data.platform.versions.length - 1 ])
      db.saveChanges()
    },

    removeVersion: function(index){
      data.platform.versions.splice(index,1)
      db.saveChanges()
    },

    addKpi: function(){
      data.product.info.kpis.push('Nuevo kpi.')
      db.saveChanges()
    },

    removeKpi: function(index){
      console.log(index)
      data.product.info.kpis.splice(index,1)
      db.saveChanges()
    },

    addStory: function(){
      data.version.stories.push({ 
        id: 3,
        text: 'Nueva historia.'
      })
      db.saveChanges()
    },

    removeStory: function(index){
      console.log(index)
      data.version.stories.splice(index,1)
      db.saveChanges()
    },

    addLeader: function(){
      data.product.leaders.push({
        role: '---',
        name: 'Juan Perez',
        email: 'hola@gmail.com'
      })
      db.saveChanges()
    },

    addExternal: function(){
      data.product.externals.push({
        area: '---',
        position: '---',
        name: 'Juan Perez',
        email: 'hola@gmail.com'
      })
      db.saveChanges()
    },

    toggleEdit: function(){
      if(data.config.editable){
        db.saveChanges()
      }
      Vue.set(data.config, 'editable', !data.config.editable);
    }
  }
})

$(document).keyup(function(event){
  if(event.keyCode == 18){
    vm.toggleEdit()
  }
})
.on('paste', '[contenteditable]', function(event){ 
    event.preventDefault();

    console.log(event)
    var text = event.originalEvent.clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
})

