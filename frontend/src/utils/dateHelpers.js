export function isThisMonth(dateStr) {
  if (!dateStr) return false; // Sin fecha → no se muestra en cumplea\u00f1os
  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const monthNamesEs = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const currentMonthName = monthNamesEs[currentMonthIdx];
  const str = String(dateStr).toLowerCase().trim();

  if (str.includes(currentMonthName) || str.includes(currentMonthName.slice(0, 3))) {
    return true;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('-');
    return parseInt(parts[1], 10) === (currentMonthIdx + 1);
  }
  const match = str.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (match) {
    const n1 = parseInt(match[1], 10);
    const n2 = parseInt(match[2], 10);
    if (n1 === currentMonthIdx + 1 || n2 === currentMonthIdx + 1) return true;
  }
  return false;
}

export function isExactToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const currentDay = today.getDate();
  const monthNamesEs = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const str = String(dateStr).toLowerCase().trim();

  let targetMonth = -1;
  let targetDay = -1;

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('-');
    targetMonth = parseInt(parts[1], 10) - 1;
    targetDay = parseInt(parts[2], 10);
  } else {
    for (let i = 0; i < monthNamesEs.length; i++) {
      if (str.includes(monthNamesEs[i]) || str.includes(monthNamesEs[i].slice(0, 3))) {
        targetMonth = i;
        const nums = str.match(/\d{1,2}/);
        if (nums) targetDay = parseInt(nums[0], 10);
        break;
      }
    }
    if (targetMonth === -1) {
      const match = str.match(/(\d{1,2})[\/\-](\d{1,2})/);
      if (match) {
        const n1 = parseInt(match[1], 10);
        const n2 = parseInt(match[2], 10);
        if (n2 - 1 === currentMonthIdx || (n2 <= 12 && n1 > 12)) {
          targetMonth = n2 - 1; targetDay = n1;
        } else {
          targetMonth = n1 - 1; targetDay = n2;
        }
      }
    }
  }

  return targetMonth === currentMonthIdx && targetDay === currentDay;
}

export function isThisWeek(dateStr, isTodayFlag) {
  if (isTodayFlag) return true;
  if (!dateStr) return false;
  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const currentYear = today.getFullYear();

  const dayOfWeek = today.getDay() || 7; // 1=Lunes ... 7=Domingo
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek + 1);
  const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek + 7, 23, 59, 59);

  let targetMonth = -1;
  let targetDay = -1;
  const str = String(dateStr).toLowerCase().trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('-');
    targetMonth = parseInt(parts[1], 10) - 1;
    targetDay = parseInt(parts[2], 10);
  } else {
    const monthNamesEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    for (let i = 0; i < monthNamesEs.length; i++) {
      if (str.includes(monthNamesEs[i]) || str.includes(monthNamesEs[i].slice(0, 3))) {
        targetMonth = i;
        const nums = str.match(/\d{1,2}/);
        if (nums) targetDay = parseInt(nums[0], 10);
        break;
      }
    }
    if (targetMonth === -1) {
      const match = str.match(/(\d{1,2})[\/\-](\d{1,2})/);
      if (match) {
        const n1 = parseInt(match[1], 10);
        const n2 = parseInt(match[2], 10);
        if (n2 - 1 === currentMonthIdx || (n2 <= 12 && n1 > 12)) {
          targetMonth = n2 - 1; targetDay = n1;
        } else {
          targetMonth = n1 - 1; targetDay = n2;
        }
      }
    }
  }

  if (targetMonth !== -1 && targetDay !== -1) {
    const targetDate = new Date(currentYear, targetMonth, targetDay, 12, 0, 0);
    return targetDate >= startOfWeek && targetDate <= endOfWeek;
  }

  return isThisMonth(dateStr);
}
