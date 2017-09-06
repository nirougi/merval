var MongoClient = require('mongodb').MongoClient;
// var Db = require('mongodb').Db;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');
var $ = require('jQuery');
// var Vue = require('vue');
var moment = require('moment');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// ==============================
// Mongo Config
// ==============================


var user = {
  host: 'jinik.com.ar:6664',
  db: 'products',
  name: 'jinik',
  password: 'prn1comanco',
}

var configoose = {
    uri: 'mongodb://'+ user.name +':'+ user.password +'@'+ user.host +'/'+ user.db ,
    options : { 
        promiseLibrary: require('bluebird') 
    }
}

mongoose.connect( configoose.uri, { useMongoClient: true } );


// ==============================
// Schemas
// ==============================


// Updates

var productSchema = Schema({
  name: String,
  leaders: [{
    owner: String,
    name: String,
    email: String
  }],
  externals: [{
    name: String,
    area: String,
    position: String,
    email: String

  }],
  info: {
    users: String,
    need: String,
    objetive: String,
    message: String,
    dependencies: String,
    kpis: Array,
  },
  experience: {
    initial: String,
    expected: String
  },
  platforms: [{
    id: String,
    version: [{
      id: String,
      stories: [{
        id: String,
        text: String
      }]
    }]
  }],
});

var Product = mongoose.model('Product', productSchema);


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

var db = {
  loadProducts: function(){
    
    var cursor = Product.find().cursor();

    data.products = [];

    cursor.on('data', function(product) {
      // console.log(product.platforms.toObject());
      product = product.toObject();
      product.isActive = false;
      data.products.push( product );
    });

    cursor.on('close', function() {
      vm.selectProduct(data.products[0])
    });

  },

  addProduct: function(){
    
    var newProduct = new Product({
      "name" : "En blanco",
      "leaders" : {},
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
    });

    newProduct.save(function (err) {
      db.loadProducts();
    });

  },

  removeProduct: function(id){
    Product.findById(id).remove(function (err) {
      db.loadProducts();
    });
  },

  saveChanges: function(){
    Product.findById(data.product._id, function (err, product) {
      if (err) return handleError(err);
      
      product.name = data.product.name;
      product.leaders = data.product.leaders;
      product.externals = data.product.externals;
      product.info = data.product.info;
      product.experience = data.product.experience;
      product.platforms = data.product.platforms;

      product.save(function (err, product) {
        if (err) return handleError(err);
      });
    });
  }
}


db.loadProducts();


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
      db.removeProduct(product._id)
    },

    selectPlatform: function (selected) {
      Vue.set(data.selected, 'platform', true)
      Vue.set(data, 'platform', selected)
      vm.selectVersion(selected.versions.length - 1)
    },

    addPlatform: function(){
      data.product.platforms.push({
        id: 'plataforma_nueva',
        versions: []
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


