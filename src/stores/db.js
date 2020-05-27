import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'

import _ from 'lodash';
// import { colors } from '../components/Charts/colorPallette'

class DB {
  @observable ready = false;
  @observable filters = {}
  @observable tables = {}
  @observable charts = {}
  @observable tabs = {}
  @observable tabsCount = 0
  @observable maintab = null

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;
    autorun(() => {

    });

  }
  clearData(){
    this.filters = observable({})
    this.tables = observable({})
    this.charts = observable({})
    this.tabs = observable({})
    this.tabsCount = 0
    this.maintab = null
    this.stores.actions.clearFilters()
  }
  async getPages(){
    let postData = {}
    postData.key = this.stores.actions.privateKey //'4vvqd9zcewdc2a'
    return POST({
        path: `GetEcpPages`,
        data: {
            ...postData,
        },
        success: data => {
          // console.log(data);
          this.router = window.stores.router
          this.stores.actions.pages = data.pages
          for( let route in data.pages ){
            setTimeout(() => { this.router && this.router.push(`/pages/${route}`) }, 0)
            break
          }
        },
        fail: (data) => {
            console.log('fail', data);
        },
        always: (data) => {
          this.stores.actions.makeAlerts(data)
          this.stores.actions.dataLoading = false
        }
    });
  }
  async getFiltered(){
    let postData = this.stores.actions.filterForm
    this.stores.actions.dataLoading = true
    postData.authkey = this.stores.actions.authkey //'4vvqd9zcewdc2a'
    postData.key = this.stores.actions.privateKey

    let { pages, currentPage } = this.stores.actions
    let path = pages[currentPage].data

    return POST({
        path,
        data: {
            ...postData,
        },
        success: data => {
          // console.log('TABLE', data);
          let tabs = data.tabs

          if(tabs && tabs.length > 0){
            for(let tabkey in tabs){
              let {
                charts,
                columns,
                currentpage,
                headerskey,
                itemscount,
                limitonpage,
                pages,
                rows,
                style,
                text,
                type,
                hintkey
              } = tabs[tabkey];

              if(type === 'Table'){
                this.tables[tabkey] = {
                  text,
                  headerskey,
                  style,
                  itemscount,
                  currentpage,
                  pages,
                  limitonpage,
                  hasHint: (hintkey >= 0),
                  headers: tabs[tabkey].columns,
                  rows: observable.map({}, tabkey),
                  ready: observable.box(false)
                }
                var i = 0
                if(_.isArray(tabs[tabkey].rows)){
                  tabs[tabkey].rows.forEach((rowC, i, arr) => {
                    let row = _.clone(rowC)
                    i++
                    let myHeight = 40
                    for(let key in row){
                      if(row[key].type === 'JsonArray' || row[key].type === 'JsonArrayImg'){
                        let arr = JSON.parse(row[key].value)
                        //if(_.isArray(arr)) {
                          row[key].value = arr
                          //myHeight = arr.length*30 < myHeight ? myHeight : arr.length*30
                        //}
                      }
                    }
                    this.tables[tabkey].rows.set(i, { cells: row, height: myHeight })
                  })
                }
                this.tables[tabkey].ready.set(true)

                this.tabsCount++
              }else if(type === 'Chart'){
                this.charts[tabkey] = {
                  text,
                  headerskey,
                  style,
                  itemscount,
                  currentpage,
                  pages,
                  limitonpage,
                  names: charts.names,
                  types: charts.types,
                  xType: charts.xType,
                  legendBy: charts.legendBy,
                  // colors: charts.colors,
                  legend: charts.legends,
                  view: charts.view,
                  data: charts.rows,
                  ready: observable.box(false)
                }

                this.charts[tabkey].ready.set(true)
              }

              this.tabs[tabkey] = {
                text,
                type,
                key: tabkey,
                itemscount: tabs[tabkey].itemscount,
                headerskey,
                style,
                currentpage,
                pages,
                limitonpage,
                headers: tabs[tabkey].columns,
                ready: observable.box(false)
              }


              this.tabs[tabkey].ready.set(true)
            }
          }
          this.stores.actions.dataLoading = false
          //console.log({ 1: this.maintab, 2: data.firsttab });
          this.maintab = data.firsttab //.toString()
          this.stores.actions.filtersChanged = false
        },
        fail: (data) => {
            console.log('fail', data);
        },
        always: (data) => {
          this.stores.actions.makeAlerts(data)
          this.stores.actions.dataLoading = false
        }
    });
  }

  async getFilteredXLS(){
    let postData = this.stores.actions.filterForm

    postData.authkey = this.stores.actions.authkey //'4vvqd9zcewdc2a'
    postData.key = this.stores.actions.privateKey

    return POST({
        path: `GetTableXLS`,
        // path: `http://dev.socmedica.com/2/api/abc/analyze2`,
        // path: `http://dev.socmedica.com/2/api/abc/analyze`,
        // path: `https://cs.socmedica.com/api/abc/analyze`,
        options: {
          responseType: 'blob'
        },
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        data: {
            ...postData,
            // toParent: formData.toParent / 100,
            // toChild: formData.toChild / 100,
            // highPercent: formData.highPercent / 100,
            // lowPercent: formData.lowPercent / 100,
            // toPrevalenceDefault: formData.toPrevalenceDefault / 100,
            // toPrevalenceStep: formData.toPrevalenceStep / 100,
            // toBinarization: formData.toBinarization / 100,
            // // key: SERVICE_KEY,
            // // login: "",
            // authkey: localStorage.getItem('authkey')
        },
        success: data => {
          // console.log('TABLE', data);
          const url = window.URL.createObjectURL(new Blob([data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'file.xls');
          document.body.appendChild(link);
          link.click();
        },
        fail: (data) => {
            console.log('fail', data);
        },
        always: (data) => {
          this.stores.actions.makeAlerts(data)
        }
    });
  }

  async getFilters(){
    let data = {}

    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey

    let { pages, currentPage } = this.stores.actions
    // console.log('FILTERS', { pages, currentPage }, pages[currentPage]);

    let path = pages[currentPage].filters

    return POST({
        path,
        data,
        success: async data => {
          const { exception, alert, filters, ...other } = data
           // console.log('Filters', filters);
          for(let filter in filters){
            // JSON.parse(row[key].value)
            const current = filters[filter]
            // console.log(current.value);
            const rows = await JSON.parse(current.value)
            let newRows = []
            if( rows && _.isArray(rows) ){
              rows.forEach((item, key) => {
                newRows.push({ _id: item, name: item})
              })
            }


            if(current.type === 'SelectMulti'){
              this.filters[filter] = {
                title: current.title,
                type: current.type,
                returntype: current.returntype,
                rows: newRows,
                ready: observable.box(true)
              }
              this.stores.actions.filterForm.filters[filter] = observable([])
            }
            if(current.type === 'Matreshka'){
              let newRows = []
              let filterObj = {}
              rows.forEach((row, i) => {
                let values = []
                Object.keys(row.Value).forEach((key, x) => {
                  values.push({ _id: key, value: row.Value[key] })
                })
                newRows.push({ _id: row.Key, name: row.Key, values })
                //filterObj[row.Key] = observable({})
              })
              // console.log('newRows', newRows);
              this.filters[filter] = {
                title: current.title,
                type: current.type,
                returntype: current.returntype,
                rows: newRows,
                ready: observable.box(true)
              }
              this.stores.actions.filterForm.filters[filter] = observable({})
            }
            if(current.type === 'DateTime'){
              this.filters[filter] = {
                title: current.title,
                type: current.type,
                returntype: current.returntype,
                value: current.value,
                ready: observable.box(true)
              }
              this.stores.actions.filterForm.filters[filter] = current.value || 0
            }
            if(current.type === 'SearchStringMulti'){
              this.filters[filter] = {
                title: current.title,
                type: current.type,
                returntype: current.returntype,
                ready: observable.box(true),
                rows: observable([])
              }
              this.stores.actions.filterForm.filters[filter] = observable([])
              this.stores.actions.filterTpl[filter]=observable(rows)
            }

          }

        },
        fail: (alerts) => {
            console.log('fail', alerts);
        },
        always: (data) => {
          this.stores.actions.makeAlerts(data)
        }
    });
  }
  parseConcepts(arr){

  }
  async getSearch(text, filterName){
    let data = _.clone(this.stores.actions.filterTpl[filterName])
    data.text = text
    // data.key = '1f9b2da3f046b34b'
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `SearchConceptList`,
        data,
        success: async data => {
          // console.log('DATA', data);
          //
          // let oldArr = await _.clone(this.filters[filterName].rows)
          // let newArr = []
          if(data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {


            this.filters[filterName].rows = await _.unionWith(data.concepts, this.filters[filterName].rows, (a, b) => a.umkbid === b.umkbid);

          }
        },
        fail: (alerts) => {
          // console.log('fail', alerts);
        },
        always: (data) => {
          // this.stores.actions.makeAlerts(data)
        }
    });
  }

  // @action track(colName, dbName, filter){
  //   this[dbName].data.clear()
  //   this.dbs[colName].find(filter).observeChanges({
  //     changed: (_id, item) => {
  //       //console.log('CHANGED', item);
  //       let current = this[dbName].data.get(_id) || {};
  //       this[dbName].data.set(_id, _.extend(current, {_id, ...item}));
  //     },
  //     addedBefore: (_id, item, before) => {
  //       //console.log('ADDED', item);
  //       let current = this[dbName].data.get(_id) || {};
  //       this[dbName].data.set(_id, _.extend(current, {_id, ...item}));
  //       if( before == null ) this[dbName].ready.set(true)
  //     },
  //     removed: (_id) => {
  //       //console.log('REMOVED', _id);
  //       this[dbName].data.delete(_id);
  //     }
  //   })
  // }
  @action updateModel(name, item, key, arr){
    //console.log('Update '+name);
    //Meteor.setTimeout(() => {
      let { _id } = item
      if(item.deleted){
        this[name].data.delete(_id);
      }else{
        let current = this[name].data.get(_id) || {};
        this[name].data.set(_id, _.extend(current, item));
      }
      if(arr.count() === (key+1) && arr.count() > 0) {this[name].ready.set(true)}
    //}, 0)

  }

  @computed get clientsArr(){
    let { company } = this.stores.actions.event
    let clients = []
    this.users.data.forEach((user, key, map) => {
      if(user.roles && user.roles.includes('client')) {
        if(!company || (company && user.company_id === company)) clients.push(user)
      }
    })
    return clients
  }



}
export default DB;
