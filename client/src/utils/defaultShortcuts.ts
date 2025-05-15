/**
 * Default Keyboard Shortcuts
 * 
 * This module defines and registers the default keyboard shortcuts for the application.
 * These shortcuts improve accessibility and enhance the experience for power users.
 */

import { registerShortcut } from './keyboardShortcuts';

export const registerDefaultKeyboardShortcuts = (): void => {
  // Navigation shortcuts
  registerShortcut({
    id: 'nav-home',
    key: 'h',
    description: 'Go to Home page',
    category: 'navigation',
    action: () => {
      window.location.href = '/';
    }
  });
  
  registerShortcut({
    id: 'nav-articles',
    key: 'a',
    description: 'Go to Articles page',
    category: 'navigation',
    action: () => {
      window.location.href = '/articles';
    }
  });
  
  registerShortcut({
    id: 'nav-courses',
    key: 'c',
    description: 'Go to Courses page',
    category: 'navigation',
    action: () => {
      window.location.href = '/courses';
    }
  });
  
  registerShortcut({
    id: 'nav-profile',
    key: 'p',
    description: 'Go to Profile page',
    category: 'navigation',
    action: () => {
      window.location.href = '/profile';
    }
  });
  
  // Search shortcuts
  registerShortcut({
    id: 'search-focus',
    key: '/',
    description: 'Focus search box',
    category: 'search',
    action: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  });
  
  registerShortcut({
    id: 'search-command',
    key: 'k',
    description: 'Open command palette',
    category: 'ui',
    ctrlKey: true,
    action: () => {
      // Dispatch a custom event that the command palette component will listen for
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    }
  });
  
  // Accessibility shortcuts
  registerShortcut({
    id: 'access-dark-mode',
    key: 'd',
    description: 'Toggle dark mode',
    category: 'accessibility',
    altKey: true,
    action: () => {
      // Dispatch event for theme toggle
      window.dispatchEvent(new CustomEvent('toggle-dark-mode'));
    }
  });
  
  registerShortcut({
    id: 'access-font-increase',
    key: '+',
    description: 'Increase font size',
    category: 'accessibility',
    ctrlKey: true,
    action: () => {
      const htmlElement = document.documentElement;
      const currentScale = parseFloat(getComputedStyle(htmlElement).getPropertyValue('--font-scale') || '1');
      const newScale = Math.min(currentScale + 0.1, 1.5);
      htmlElement.style.setProperty('--font-scale', String(newScale));
      
      // Try to save to localStorage if accessible
      try {
        const savedPrefs = localStorage.getItem('accessibilityPreferences');
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs);
          prefs.fontScale = newScale;
          localStorage.setItem('accessibilityPreferences', JSON.stringify(prefs));
        }
      } catch (e) {
        console.warn('Could not save font scale preference to localStorage', e);
      }
    }
  });
  
  registerShortcut({
    id: 'access-font-decrease',
    key: '-',
    description: 'Decrease font size',
    category: 'accessibility',
    ctrlKey: true,
    action: () => {
      const htmlElement = document.documentElement;
      const currentScale = parseFloat(getComputedStyle(htmlElement).getPropertyValue('--font-scale') || '1');
      const newScale = Math.max(currentScale - 0.1, 0.8);
      htmlElement.style.setProperty('--font-scale', String(newScale));
      
      // Try to save to localStorage if accessible
      try {
        const savedPrefs = localStorage.getItem('accessibilityPreferences');
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs);
          prefs.fontScale = newScale;
          localStorage.setItem('accessibilityPreferences', JSON.stringify(prefs));
        }
      } catch (e) {
        console.warn('Could not save font scale preference to localStorage', e);
      }
    }
  });
  
  registerShortcut({
    id: 'access-sound-toggle',
    key: 's',
    description: 'Toggle sound effects',
    category: 'accessibility',
    altKey: true,
    action: () => {
      // Toggle the global sound effects setting
      window.soundEffectsEnabled = !window.soundEffectsEnabled;
      
      // Try to save to localStorage if accessible
      try {
        const savedPrefs = localStorage.getItem('accessibilityPreferences');
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs);
          prefs.soundEffects = window.soundEffectsEnabled;
          localStorage.setItem('accessibilityPreferences', JSON.stringify(prefs));
        }
      } catch (e) {
        console.warn('Could not save sound effects preference to localStorage', e);
      }
    }
  });
  
  // UI shortcuts
  registerShortcut({
    id: 'ui-shortcuts-guide',
    key: '?',
    description: 'Show keyboard shortcuts guide',
    category: 'ui',
    action: () => {
      // Dispatch a custom event that the KeyboardShortcutsGuide component will listen for
      window.dispatchEvent(new CustomEvent('show-shortcuts-guide'));
    }
  });
  
  registerShortcut({
    id: 'ui-escape',
    key: 'Escape',
    description: 'Close modals or dialogs',
    category: 'ui',
    action: () => {
      // Find any open dialog/modal and close it
      const closeButtons = document.querySelectorAll('[data-dismiss="modal"], [data-close="true"], .modal-close, .dialog-close');
      if (closeButtons.length > 0) {
        (closeButtons[0] as HTMLElement).click();
      }
    }
  });
  
  registerShortcut({
    id: 'ui-scroll-top',
    key: 'Home',
    description: 'Scroll to top of page',
    category: 'navigation',
    action: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  registerShortcut({
    id: 'ui-scroll-bottom',
    key: 'End',
    description: 'Scroll to bottom of page',
    category: 'navigation',
    action: () => {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  });
  
  // Content shortcuts
  registerShortcut({
    id: 'content-share',
    key: 's',
    description: 'Share current page',
    category: 'content',
    ctrlKey: true,
    shiftKey: true,
    action: () => {
      // Dispatch event for sharing
      window.dispatchEvent(new CustomEvent('share-page'));
    }
  });
  
  registerShortcut({
    id: 'content-save',
    key: 'b',
    description: 'Bookmark current page',
    category: 'content',
    ctrlKey: true,
    action: () => {
      // Dispatch event for bookmarking
      window.dispatchEvent(new CustomEvent('bookmark-page'));
    }
  });
  
  console.log('Default keyboard shortcuts registered');
};

// Register default shortcuts when this module is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'complete') {
    registerDefaultKeyboardShortcuts();
  } else {
    window.addEventListener('DOMContentLoaded', registerDefaultKeyboardShortcuts);
  }
}