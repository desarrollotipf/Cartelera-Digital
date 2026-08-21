/**
 * Utilidades de detección de roles y alcances (Scopes) de usuario
 * Soporta usuarios de HSEQ, RRHH y ADMIN (Sistemas / Directivos)
 */

export function getUserScope(user) {
  if (!user) return 'RRHH';

  // 1. userScope explícito
  if (user.userScope === 'HSEQ') return 'HSEQ';
  if (user.userScope === 'ADMIN') return 'ADMIN';
  if (user.userScope === 'RRHH') return 'RRHH';

  // 2. Comprobar texto de área (areaName, area, nombre_area, etc.)
  const areaStr = String(
    user.areaName ||
    (typeof user.area === 'string' ? user.area : user.area?.nombre || user.area?.name) ||
    user.area_nombre ||
    user.nombre_area ||
    ''
  ).toUpperCase();

  if (
    areaStr.includes('HSEQ') ||
    areaStr.includes('SST') ||
    areaStr.includes('SEGURIDAD') ||
    areaStr.includes('AMBIENTAL')
  ) {
    return 'HSEQ';
  }

  // 3. Comprobar arreglo de áreas (user.areas)
  if (Array.isArray(user.areas)) {
    const hasHseq = user.areas.some(a => {
      const name = String(typeof a === 'string' ? a : a?.nombre || a?.name || '').toUpperCase();
      return name.includes('HSEQ') || name.includes('SST') || name.includes('SEGURIDAD') || name.includes('AMBIENTAL');
    });
    const hasRrhh = user.areas.some(a => {
      const name = String(typeof a === 'string' ? a : a?.nombre || a?.name || '').toUpperCase();
      return name.includes('TALENTO') || name.includes('HUMANA') || name.includes('RECURSOS');
    });

    if (hasHseq && !hasRrhh) return 'HSEQ';
    if (hasHseq) return 'HSEQ';
  }

  // 4. Comprobar cargo o rol
  const roleStr = String(user.role || user.cargo || user.rol || '').toUpperCase();
  if (
    roleStr.includes('HSEQ') ||
    roleStr.includes('SST') ||
    roleStr.includes('SEGURIDAD') ||
    roleStr.includes('AMBIENTAL')
  ) {
    return 'HSEQ';
  }

  if (
    areaStr.includes('SISTEMAS') ||
    areaStr.includes('ADMIN') ||
    roleStr.includes('ADMIN') ||
    roleStr.includes('SUPERADMIN')
  ) {
    return 'ADMIN';
  }

  return 'RRHH';
}

export function isHseqScope(user) {
  return getUserScope(user) === 'HSEQ';
}

export function isAdminScope(user) {
  return getUserScope(user) === 'ADMIN';
}
