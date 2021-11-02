export const setFilter = async (array, filters) => {
  let filtered = [...array];

  if (filters.id || filters.id === 0) {
    let result = filtered.find((bud) => bud.id === filters.id);
    filtered = result ? [result] : [];
  }

  if (filters.types.length > 0) {
    filtered = filtered.filter((bud) =>
      filters.types.some((type) => type === bud.type)
    );
  }
  if (filters.gadgets.length > 0) {
    if (filters.gadgets[0] === "No Gadget")
      filtered = filtered.filter((bud) => bud.gadgets.length <= 0);
    else
      filtered = filtered.filter((bud) => {
        return filters.gadgets.every((gadget) => bud.gadgets.includes(gadget));
      });
  }

  if (filters.range.length > 0) {
    filtered = filtered.filter(
      (bud) =>
        bud.id >= parseInt(filters.range[0]) &&
        bud.id <= parseInt(filters.range[1])
    );
  }

  if (filters.gadgetsCount || filters.gadgetsCount === 0) {
    filtered = filtered.filter(
      (bud) => bud.gadgets.length >= parseInt(filters.gadgetsCount)
    );
  }

  if (filters.order_id) {
    filtered = filtered.sort((a, b) =>
      filters.order_id === "ASC" ? a.id - b.id : b.id - a.id
    );
  }
  if (filters.order_price) {
    filtered = sortArray(filtered, filters.order_price);
  }

  if (filters.on_sale) {
    filtered = filtered.filter((bud) => bud.price);
  }

  return filtered;
};

const filterBudz = (array, filterOption) => {
  const copy = array.filter((bud) => filterOption(bud));
  return copy;
};

const sortArray = (array, price) => {
  const copy = [...array];
  copy.sort((a, b) => {
    // equal items sort equally
    if (a.price === b.price) {
      return 0;
    }
    // nulls sort after anything else
    else if (!a.price) {
      return 1;
    } else if (!b.price) {
      return -1;
    }
    // otherwise, if we're ascending, lowest sorts first
    else if (price === "ASC") {
      return a.price < b.price ? -1 : 1;
    }
    // if descending, highest sorts first
    else if (price === "DESC") {
      return a.price < b.price ? 1 : -1;
    }
    // if (!a.price || !b.price) return 1;
    // return a.price > b.price ? 1 : -1;
  });
  return copy;
};
