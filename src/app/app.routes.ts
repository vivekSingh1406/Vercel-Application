import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent) },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery-page').then((m) => m.GalleryPage),
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/blogs/blog-list').then((m) => m.BlogList),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./features/blogs/blog-detail').then((m) => m.BlogDetail),
  },
  {
    path: 'submit-blog',
    loadComponent: () => import('./features/submit-blog/submit-blog').then((m) => m.SubmitBlog),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then((m) => m.AdminComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found').then((m) => m.NotFoundComponent),
  },
];
