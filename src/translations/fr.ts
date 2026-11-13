import type { en } from './en';

export const fr: Record<keyof typeof en, string> = {
  'pageTemplate.navbarLabel': 'Principale',
  'pageTemplate.skipToContent': 'Aller au contenu principal',
  'button.loading': 'Chargement',
  'formField.badInput': 'Saisissez une valeur complète et valide.',
  'formField.patternMismatch': 'Saisissez une valeur au format demandé.',
  'formField.rangeOverflow': 'Saisissez une valeur inférieure ou égale à {max}.',
  'formField.rangeUnderflow': 'Saisissez une valeur supérieure ou égale à {min}.',
  'formField.stepMismatch': 'Saisissez une valeur par pas de {step}.',
  'formField.tooLong': 'Utilisez {maxLength} caractères au maximum.',
  'formField.tooShort': 'Utilisez au moins {minLength} caractères.',
  'formField.typeMismatch': 'Saisissez une valeur au format attendu.',
  'formField.typeMismatch.email': 'Saisissez une adresse e-mail comme nom@exemple.fr.',
  'formField.typeMismatch.url':
    'Saisissez une adresse web complète commençant par https://.',
  'formField.valueMissing': 'Remplissez ce champ pour continuer.',
  'formField.valueMissing.checkbox': 'Cochez cette case pour continuer.',
  'formField.valueMissing.switch': 'Activez cette option pour continuer.',
  'languageSwitcher.label': 'Langue',
  'appHeader.menu': 'Menu',
  'link.external': '(ouvre dans une nouvelle fenêtre)',
  'navBar.label': 'Principale',
  'spinner.loading': 'Chargement',
  'themeSwitcher.dark': 'Sombre',
  'themeSwitcher.label': 'Thème',
  'themeSwitcher.light': 'Clair',
};
