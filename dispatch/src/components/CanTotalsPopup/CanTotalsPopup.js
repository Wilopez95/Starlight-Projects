/* eslint-disable no-unused-vars */
export function countCansBySize(cans) {
  const newCans = cans.reduce((acc, el) => {
    if (!acc[el.size]) {
      acc[el.size] = {
        available: 0,
        total: 0,
      };
    }
    acc[el.size].total++;
    if (!(el.requiresMaintenance || el.outOfService)) {
      acc[el.size].available++;
    }
    return acc;
  }, {});

  return Object.keys(newCans).map((size) => ({
    size,
    available: newCans[size].available,
    total: newCans[size].total,
  }));
}

function makeCanTotalsPopup(cansArray) {
  const buildTBody = (prev, currEl) =>
    `${prev}
    <tr>
      <td> ${currEl.size} </td>
      <td> ${currEl.available} </td>
      <td> ${currEl.total} </td>
    </tr>`;

  const rows = cansArray.length
    ? countCansBySize(cansArray).reduce(buildTBody, '')
    : '<tr><td align="center" colspan="3">Empty</td></tr>';

  return `<table class="info-window-can-count hint-table">
                <thead>
                    <tr><th>Size</th><th>Available</th><th>Total</th></tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>`;
}

export default makeCanTotalsPopup;
