import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
<<<<<<< HEAD
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
=======
>>>>>>> a7a8f08 (feat: home component)
import { guestGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [guestGuard]
  },
  {
<<<<<<< HEAD
    path: 'verify-email',
    component: EmailVerificationComponent
    // No guard needed - verification should work for everyone
  },
  {
=======
>>>>>>> a7a8f08 (feat: home component)
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

