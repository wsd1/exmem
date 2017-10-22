import Vue from 'vue'
import Router from 'vue-router'
import editor from '@/components/editor'
import mdeditor from '@/components/mdeditor'
import nav from '@/components/nav'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/*',
      name: 'mdeditor',
      component: mdeditor
    }
  ]
})
