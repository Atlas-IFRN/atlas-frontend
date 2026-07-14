export type CourseCategory = 'ads' | 'informatica' | 'other'

function normalizeCourseName(courseName: string) {
  return courseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
}

export function getCourseCategory(courseName: string): CourseCategory {
  const normalizedCourseName = normalizeCourseName(courseName)

  if (
    normalizedCourseName === 'ads' ||
    normalizedCourseName.includes('analise e desenvolvimento de sistemas')
  ) {
    return 'ads'
  }

  if (normalizedCourseName.includes('informatica')) {
    return 'informatica'
  }

  return 'other'
}

export function getCourseLabel(courseName: string) {
  const category = getCourseCategory(courseName)

  if (category === 'ads') {
    return 'ADS'
  }

  if (category === 'informatica') {
    return 'Informática'
  }

  return courseName
}
