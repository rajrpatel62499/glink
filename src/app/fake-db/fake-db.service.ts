import { AcademyFakeDb } from 'app/fake-db/academy';
// import { AlocationFakeDb } from './alocation';
import { AnalyticsDashboardDb } from 'app/fake-db/dashboard-analytics';
import { CalendarFakeDb } from 'app/fake-db/calendar';
import { ChatFakeDb } from 'app/fake-db/chat';
import { ChatPanelFakeDb } from 'app/fake-db/chat-panel';
import { FigmaFakeDb } from 'app/fake-db/figma';
import { FigmaPanelFakeDb } from 'app/fake-db/figma-panel';
import { ContactsFakeDb } from 'app/fake-db/contacts';
import { ECommerceFakeDb } from 'app/fake-db/e-commerce';
import { EmployeeFakeDb } from 'app/fake-db/employee';
import { FaqFakeDb } from 'app/fake-db/faq';
import { FileManagerFakeDb } from 'app/fake-db/file-manager';
import { IconsFakeDb } from 'app/fake-db/icons';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { InvoiceFakeDb } from 'app/fake-db/invoice';
import { KnowledgeBaseFakeDb } from 'app/fake-db/knowledge-base';
import { LocationFakeDb } from 'app/fake-db/location';
import { MailFakeDb } from 'app/fake-db/mail';
import { ProfileFakeDb } from 'app/fake-db/profile';
import { ProjectDashboardDb } from 'app/fake-db/dashboard-project';
import { QuickPanelFakeDb } from 'app/fake-db/quick-panel';
import { ScheduleFakeDb } from 'app/fake-db/schedule';
import { ScrumboardFakeDb } from 'app/fake-db/scrumboard';
import { SearchFakeDb } from 'app/fake-db/search';
import { TaskFakeDb } from './task';
import { TodoFakeDb } from 'app/fake-db/todo';
import { UserFakeDb } from './user';
// import { UserManagerFakeDb } from './user-manager';

export class FakeDbService implements InMemoryDbService {
  createDb(): any {
    return {
      // Dashboards
      'project-dashboard-projects': ProjectDashboardDb.projects,
      'project-dashboard-widgets': ProjectDashboardDb.widgets,
      'analytics-dashboard-widgets': AnalyticsDashboardDb.widgets,

      // Calendar
      calendar: CalendarFakeDb.data,

      // E-Commerce
      'e-commerce-products': ECommerceFakeDb.products,
      'e-commerce-orders': ECommerceFakeDb.orders,

      // Academy
      'academy-categories': AcademyFakeDb.categories,
      'academy-courses': AcademyFakeDb.courses,
      'academy-course': AcademyFakeDb.course,

      // Mail
      'mail-mails': MailFakeDb.mails,
      'mail-folders': MailFakeDb.folders,
      'mail-filters': MailFakeDb.filters,
      'mail-labels': MailFakeDb.labels,

      // Chat
      'chat-contacts': ChatFakeDb.contacts,
      'chat-chats': ChatFakeDb.chats,
      'chat-user': ChatFakeDb.user,

      'figma-contacts': FigmaFakeDb.contacts,
      'figma-figmas': FigmaFakeDb.figmas,
      'figma-user': FigmaFakeDb.user,

      // File Manager
      'file-manager': FileManagerFakeDb.files,

      // // User Manager
      // 'user-manager': UserManagerFakeDb.users,

      // Contacts
      'contacts-contacts': ContactsFakeDb.contacts,
      'contacts-user': ContactsFakeDb.user,

      // Todo
      'todo-todos': TodoFakeDb.todos,
      'todo-filters': TodoFakeDb.filters,
      'todo-tags': TodoFakeDb.tags,

      // User
      'user-users': UserFakeDb.users,
      'user-filters': UserFakeDb.filters,
      'user-tags': UserFakeDb.tags,

      // Location
      // 'location-locations'  : AlocationFakeDb.locations,
      // 'location-filters': AlocationFakeDb.filters,
      // 'location-tags'   : AlocationFakeDb.tags,

      // Location
      'location-locations': LocationFakeDb.locations,
      'location-filters': LocationFakeDb.filters,
      'location-tags': LocationFakeDb.tags,

      // Employee
      'employee-employees': EmployeeFakeDb.employees,
      'employee-filters': EmployeeFakeDb.filters,
      'employee-tags': EmployeeFakeDb.tags,

      // Schedule
      'schedule-schedules': ScheduleFakeDb.schedules,
      'schedule-filters': ScheduleFakeDb.filters,
      'schedule-tags': ScheduleFakeDb.tags,

      // Task
      'task-schedules': TaskFakeDb.tasks,
      'task-filters': TaskFakeDb.filters,
      'task-tags': TaskFakeDb.tags,

      // Scrumboard
      'client-banners': ScrumboardFakeDb.banners,

      // Invoice
      invoice: InvoiceFakeDb.invoice,

      // Profile
      'profile-timeline': ProfileFakeDb.timeline,
      'profile-photos-videos': ProfileFakeDb.photosVideos,
      'profile-about': ProfileFakeDb.about,

      // Search
      search: SearchFakeDb.search,

      // FAQ
      faq: FaqFakeDb.data,

      // Knowledge base
      'knowledge-base': KnowledgeBaseFakeDb.data,

      // Icons
      icons: IconsFakeDb.icons,

      // Chat Panel
      'chat-panel-contacts': ChatPanelFakeDb.contacts,
      'chat-panel-chats': ChatPanelFakeDb.chats,
      'chat-panel-user': ChatPanelFakeDb.user,

      // Quick Panel
      'quick-panel-notes': QuickPanelFakeDb.notes,
      'quick-panel-events': QuickPanelFakeDb.events,
    };
  }
}
