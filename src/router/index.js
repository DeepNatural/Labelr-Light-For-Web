import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../views/Main.vue'
import Polygon from '../views/Polygon.vue'
import ImageAnnotation from '../views/ImageAnnotation.vue'
import Book from '../views/Book.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
  },
  {
    path: '/polygon',
    name: 'Polygon',
    component: Polygon,
  },
  {
    path: '/image-annotation',
    name: 'ImageAnnotation',
    component: ImageAnnotation,
  },
  {
    path: '/book',
    name: 'Book',
    component: Book,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
