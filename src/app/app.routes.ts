import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
<<<<<<< HEAD
    path: 'reset-password',
    redirectTo: '/auth/reset-password',
    pathMatch: 'full'
  },
  {
=======
>>>>>>> a7a8f08 (feat: home component)
    path: 'landing',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.landingRoutes)
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes)
  },
  {
    path: 'write',
<<<<<<< HEAD
    redirectTo: '/posts/write',
    pathMatch: 'full'
=======
    loadChildren: () => import('./features/blog-editor/blog-editor.routes').then(m => m.blogEditorRoutes)
>>>>>>> a7a8f08 (feat: home component)
  },
  {
    path: 'posts',
    loadChildren: () => import('./features/posts/posts.routes').then(m => m.postsRoutes)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: '**',
    redirectTo: '/landing'
  }
];
