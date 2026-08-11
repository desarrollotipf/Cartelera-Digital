/**
 * Módulo para el formateo estandarizado y preciso de nombres y apellidos 
 * provenientes de la base de datos de Gestión Humana (rrhh.persona) o entradas manuales.
 * 
 * En la BD institucional (Postgres), los nombres de nómina vienen en MAYÚSCULAS bajo el orden:
 * [APELLIDO PATERNO] [APELLIDO MATERNO] [PRIMER NOMBRE] [SEGUNDO NOMBRE]
 * Si no existe segundo apellido, la BD genera un doble espacio entre el primer apellido y el primer nombre.
 */

const PARTICLES = new Set([
  'DE', 'DEL', 'LA', 'LAS', 'LOS', 'EL', 'DA', 'DI', 'VAN', 'VON', 'MAC', 'MC', 'SAN', 'SANTA', 'Y',
  'de', 'del', 'la', 'las', 'los', 'el', 'da', 'di', 'van', 'von', 'mac', 'mc', 'san', 'santa', 'y'
]);

const NON_PERSON_KEYWORDS = [
  'PASANTE', 'PRUEBA', 'GRANJA', 'SISTEMA', 'INVITADO', 'GERENCIA', 'ADMIN', 'ADMINISTRADOR', 'EQUIPO'
];

/**
 * Agrupa palabras combinando particles o preposiciones (ej: "DE", "LA", "SAN")
 * con el sustantivo posterior para formar un único token del apellido/nombre compuesto.
 */
export function tokenizeWords(words) {
  if (!words || words.length === 0) return [];
  const tokens = [];
  let currentToken = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    currentToken.push(word);
    const upper = word.toUpperCase();
    // Cerrar token si no es una partícula o si es la última palabra del arreglo
    if (!PARTICLES.has(upper) || i === words.length - 1) {
      tokens.push(currentToken.join(' '));
      currentToken = [];
    }
  }

  if (currentToken.length > 0) {
    tokens.push(currentToken.join(' '));
  }

  return tokens;
}

/**
 * Analiza un nombre completo y retorna las piezas clave: { primerNombre, primerApellido, esCompleto }
 */
function parseNameComponents(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { primerNombre: 'Colaborador', primerApellido: '', esCompleto: false };
  }

  const rawName = fullName.trim();
  if (!rawName) {
    return { primerNombre: 'Colaborador', primerApellido: '', esCompleto: false };
  }

  const upper = rawName.toUpperCase();

  // 1. Verificar si es una entidad no personal o de prueba
  for (const kw of NON_PERSON_KEYWORDS) {
    if (upper.includes(kw)) {
      const clean = rawName.replace(/\s+/g, ' ');
      return { primerNombre: clean, primerApellido: '', esCompleto: true };
    }
  }

  // 2. Comprobar orden computacional: ¿Viene en mayúsculas sostenidas desde la base de datos (Apellidos Nombres)?
  // Si tiene minúsculas ("Carlos Mario López"), asumimos entrada manual estándar: [Nombres] [Apellidos]
  const isAllCaps = (rawName === upper);

  // 3. Verificar si hay un separador de doble espacio (\s{2,}) que indica separación explícita entre [Apellidos] y [Nombres]
  if (/\s{2,}/.test(rawName) && isAllCaps) {
    const blocks = rawName.split(/\s{2,}/).map(b => b.trim()).filter(Boolean);
    if (blocks.length >= 2) {
      const apTokens = tokenizeWords(blocks[0].split(/\s+/));
      const nomTokens = tokenizeWords(blocks.slice(1).join(' ').split(/\s+/));
      const pApellido = apTokens[0] || '';
      const pNombre = nomTokens[0] || '';
      if (pNombre || pApellido) {
        return {
          primerNombre: pNombre || pApellido,
          primerApellido: pNombre ? pApellido : '',
          esCompleto: false
        };
      }
    }
  }

  // 4. Tokenizar de forma estándar reemplazando múltiples espacios por uno solo
  const words = rawName.replace(/\s+/g, ' ').split(' ').filter(Boolean);
  const tokens = tokenizeWords(words);

  if (tokens.length === 0) {
    return { primerNombre: 'Colaborador', primerApellido: '', esCompleto: false };
  }
  if (tokens.length === 1) {
    return { primerNombre: tokens[0], primerApellido: '', esCompleto: false };
  }
  if (tokens.length === 2) {
    // Si es DB (AllCaps), orden es [Apellido, Nombre]. Si es manual (MixCase), orden es [Nombre, Apellido]
    if (isAllCaps) {
      return { primerNombre: tokens[1], primerApellido: tokens[0], esCompleto: false };
    } else {
      return { primerNombre: tokens[0], primerApellido: tokens[1], esCompleto: false };
    }
  }

  // Si son 3 o más tokens:
  if (isAllCaps) {
    // Estructura de BD: [Apellido1, Apellido2, Nombre1, Nombre2...] -> tokens[0] es Primer Apellido, tokens[2] es Primer Nombre
    return { primerNombre: tokens[2], primerApellido: tokens[0], esCompleto: false };
  } else {
    // Estructura manual (MixCase): [Nombre1, Nombre2..., Apellido1, Apellido2...]
    // Tomamos el primer token como Nombre y el último como Apellido
    return { primerNombre: tokens[0], primerApellido: tokens[tokens.length - 1], esCompleto: false };
  }
}

/**
 * Retorna el formato estándar de visualización de cartelera: "PRIMER_NOMBRE PRIMER_APELLIDO"
 * Ejemplo: "MANIOS MANJARREZ JORGE ELIECER" -> "JORGE MANIOS"
 */
export function formatShortName(fullName) {
  const { primerNombre, primerApellido } = parseNameComponents(fullName);
  if (!primerApellido) {
    return primerNombre;
  }
  return `${primerNombre} ${primerApellido}`.trim();
}

/**
 * Retorna únicamente el PRIMER NOMBRE de la persona para saludos o celebraciones festivas.
 * Ejemplo: "DE LA ROSA ARRIETA EDER ANTONIO" -> "EDER"
 */
export function formatFirstName(fullName) {
  const { primerNombre } = parseNameComponents(fullName);
  return primerNombre;
}
