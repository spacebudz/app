import * as React from "react";
import {
  ArrayParam,
  BooleanParam,
  decodeArray,
  DecodedValueMap,
  encodeArray,
  QueryParamConfig,
  StringParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
import { NodeContent } from "../../components";
import { fromLovelace, toLovelace } from "../../utils";
import NumberFormat from "react-number-format";
import { Button, Checkbox, Disclosure, Input, Select } from "../../components";
import { FlatButton } from "../../components/Button/FlatButton";
import { TYPES_GADGETS_COUNT } from "../../config";
import { FilterAlt } from "@styled-icons/material-rounded/FilterAlt";
import { ArrowRightShort } from "@styled-icons/bootstrap/ArrowRightShort";

export type Filter = {
  type?: QueryParamConfig<string[], string[]>;
  gadget?: QueryParamConfig<string[], string[]>;
  buyRange?: QueryParamConfig<string[], string[]>;
  bidRange?: QueryParamConfig<string[], string[]>;
  gadgetsCount?: QueryParamConfig<string[], string[]>;
  onSale?: QueryParamConfig<boolean, boolean>;
  onBid?: QueryParamConfig<boolean, boolean>;
};

type Order =
  | "ASC_BUY"
  | "DESC_BUY"
  | "ASC_BID"
  | "DESC_BID"
  | "ASC_ID"
  | "DESC_ID"
  | "ASC_MINT"
  | "DESC_MINT";

export type Sort = {
  sort?: QueryParamConfig<Order, string>;
};

export type Search = {
  search?: QueryParamConfig<string, string>;
};

export const useFiltering = () => ({
  ...useFilter(),
  ...useSort(),
  ...useSearch(),
});

const RangeParam = {
  encode: (array: string[] | null | undefined) =>
    encodeArray(array[0] === "MIN" && array[1] === "MAX" ? [] : array),
  decode: (arrayStr: string | string[] | null | undefined) =>
    decodeArray(arrayStr),
};

const useFilter = () => {
  const [filter, setFilter] = useQueryParams<Filter>({
    type: withDefault(ArrayParam, []),
    gadget: withDefault(ArrayParam, []),
    buyRange: withDefault(RangeParam, ["MIN", "MAX"]),
    bidRange: withDefault(RangeParam, ["MIN", "MAX"]),
    gadgetsCount: withDefault(RangeParam, ["MIN", "MAX"]),
    onSale: BooleanParam,
    onBid: BooleanParam,
  });

  return {
    filter,
    setTypes: (type) => setFilter((f) => ({ ...f, type })),
    setGadgets: (gadget) => setFilter((f) => ({ ...f, gadget })),
    setBuyRange: (buyRange) => setFilter((f) => ({ ...f, buyRange })),
    setBidRange: (bidRange) => setFilter((f) => ({ ...f, bidRange })),
    setGadgetsCount: (gadgetsCount) =>
      setFilter((f) => ({ ...f, gadgetsCount })),
    setOnSale: (onSale) => setFilter((f) => ({ ...f, onSale })),
    setOnBid: (onBid) => setFilter((f) => ({ ...f, onBid })),
    clear: () => clearFilter(filter, setFilter),
  };
};

const clearFilter = (filter, setFilter) => {
  const defaultFilter = {
    type: [],
    gadget: [],
    buyRange: ["MIN", "MAX"],
    bidRange: ["MIN", "MAX"],
    gadgetsCount: ["MIN", "MAX"],
    onSale: undefined,
    onBid: undefined,
  };

  if (
    !(
      filter.type.length === 0 &&
      filter.gadget.length === 0 &&
      filter.buyRange[0] === "MIN" &&
      filter.buyRange[1] === "MAX" &&
      filter.bidRange[0] === "MIN" &&
      filter.bidRange[1] === "MAX" &&
      filter.gadgetsCount[0] === "MIN" &&
      filter.gadgetsCount[1] === "MAX" &&
      filter.onSale === undefined &&
      filter.onBid === undefined
    )
  )
    setFilter(defaultFilter);
};

const useSort = () => {
  const [{ sort }, setSort] = useQueryParams<Sort>({
    sort: StringParam,
  });

  return {
    sort,
    setSort,
  };
};

const useSearch = () => {
  const [{ search }, setSearch] = useQueryParams<Search>({
    search: StringParam,
  });
  return { search, setSearch };
};

export const makeFilter = (
  node: NodeContent,
  filter: DecodedValueMap<Filter>
) => {
  return (
    (filter.type.length > 0 ? filter.type.includes(node.type) : true) &&
    (filter.gadget.length > 0
      ? filter.gadget.every((gadget) =>
          gadget.startsWith("NOT_")
            ? !node.traits.includes(gadget.slice(4))
            : node.traits.includes(gadget)
        )
      : true) &&
    (filter.buyRange
      ? (filter.buyRange[0] === "MIN" ||
          BigInt(filter.buyRange[0]) <= node.buy) &&
        (filter.buyRange[1] === "MAX" || node.buy <= BigInt(filter.buyRange[1]))
      : true) &&
    (filter.bidRange
      ? (filter.bidRange[0] === "MIN" ||
          BigInt(filter.bidRange[0]) <= node.bid) &&
        (filter.bidRange[1] === "MAX" || node.bid <= BigInt(filter.bidRange[1]))
      : true) &&
    (filter.gadgetsCount
      ? (filter.gadgetsCount[0] === "MIN" ||
          BigInt(filter.gadgetsCount[0]) <= node.traits.length) &&
        (filter.gadgetsCount[1] === "MAX" ||
          node.traits.length <= BigInt(filter.gadgetsCount[1]))
      : true) &&
    (filter.onSale ? node.buy?.toString() : true) &&
    (filter.onBid ? node.bid?.toString() : true)
  );
};

export const makeSort = (
  a: NodeContent,
  b: NodeContent,
  sort: DecodedValueMap<Sort>
) => {
  if (!sort) return;
  const ordering = sort as Order;
  switch (ordering) {
    case "ASC_BUY": {
      if (!a.buy) return 1;
      if (!b.buy) return -1;
      if (a.buy < b.buy) return -1;
      if (a.buy > b.buy) return 1;
      return 0;
    }
    case "DESC_BUY": {
      if (a.buy < b.buy) return 1;
      if (a.buy > b.buy) return -1;
      return 0;
    }
    case "ASC_BID": {
      if (!a.bid) return 1;
      if (!b.bid) return -1;
      if (a.bid < b.bid) return -1;
      if (a.bid > b.bid) return 1;
      return 0;
    }
    case "DESC_BID": {
      if (a.bid < b.bid) return 1;
      if (a.bid > b.bid) return -1;
      return 0;
    }
    case "ASC_ID": {
      if (a.budId < b.budId) return -1;
      if (a.budId > b.budId) return 1;
      return 0;
    }
    case "DESC_ID": {
      if (a.budId < b.budId) return 1;
      if (a.budId > b.budId) return -1;
      return 0;
    }
    case "ASC_MINT": {
      if (a.mint < b.mint) return -1;
      if (a.mint > b.mint) return 1;
      return 0;
    }
    case "DESC_MINT": {
      if (a.mint < b.mint) return 1;
      if (a.mint > b.mint) return -1;
      return 0;
    }
  }
};

export const makeSearch = (
  search
): {
  idSearch: number[] | null;
  filterSearch: DecodedValueMap<Filter> | null;
} => {
  if (!search) return { idSearch: null, filterSearch: null };
  const formattedSearch = search.trim().split(/[ ,]+/);

  const isType = (tag) =>
    Object.keys(TYPES_GADGETS_COUNT.types).find((type) =>
      type.toLowerCase().includes(tag.toLowerCase())
    );

  const isGadget = (tag) =>
    Object.keys(TYPES_GADGETS_COUNT.gadgets).find((gadget) =>
      gadget.toLowerCase().includes(tag.toLowerCase())
    );

  const id: number[] = [];
  const type: string[] = [];
  const gadget: string[] = [];
  formattedSearch.forEach((tag) => {
    if (!isNaN(tag)) id.push(parseInt(tag));
    else {
      const typeTag = isType(tag);
      const gadgetTag = isGadget(tag);
      if (typeTag) type.push(typeTag);
      else if (gadgetTag) gadget.push(gadgetTag);
      else type.push(tag);
    }
  });
  const filter: DecodedValueMap<Filter> = {
    type,
    gadget,
  };

  return {
    idSearch: id.length > 0 ? id : null,
    filterSearch: type.length > 0 || gadget.length > 0 ? filter : null,
  };
};

export const FilterTile = ({
  entry,
  setFilter,
  filter,
  kind,
  negate = false,
}) => {
  const [name, amount] = entry;
  const selected = filter[kind].find((gadget) => gadget.includes(name));
  const negatedName = selected?.startsWith("NOT_") && selected.slice(4);
  return (
    <div
      className={`border-2 p-2 border-slate-900 rounded-xl text-xs cursor-pointer flex justify-center items-center text-center font-bold ${
        selected ? (negatedName ? "bg-rose-400" : "bg-primary") : ""
      }`}
      onClick={() => {
        if (selected && negatedName) {
          // this one needs to be the selected variable, because of the NON_ prefix
          const index = filter[kind].indexOf(selected);
          filter[kind].splice(index, 1);
          setFilter(filter[kind]);
        } else if (selected) {
          if (negate) {
            const index = filter[kind].indexOf(name);
            filter[kind][index] = "NOT_" + name;
            setFilter(filter[kind]);
          } else {
            const index = filter[kind].indexOf(name);
            filter[kind].splice(index, 1);
            setFilter(filter[kind]);
          }
        } else {
          filter[kind].push(name);
          setFilter(filter[kind]);
        }
      }}
    >
      {name}
      <br />({amount})
    </div>
  );
};

export const RangeFilter = ({
  filter,
  setFilter,
  kind,
  placeholderMin,
  placeholderMax,
  adaConversion = false,
}) => {
  const toUnit = (value) => (adaConversion ? toLovelace(value) : value);
  const fromUnit = (value) =>
    adaConversion ? fromLovelace(BigInt(value)) : value;

  const checkMin = () => (!min ? "MIN" : toUnit(min));
  const checkMax = () => (!max ? "MAX" : toUnit(max));
  const setRange = () => setFilter([checkMin(), checkMax()]);

  const [min, setMin] = React.useState(
    filter[kind][0] === "MIN" ? "" : fromUnit(filter[kind][0])
  );
  const [max, setMax] = React.useState(
    filter[kind][1] === "MAX" ? "" : fromUnit(filter[kind][1])
  );

  React.useEffect(() => {
    setMin(filter[kind][0] === "MIN" ? "" : fromUnit(filter[kind][0]));
    setMax(filter[kind][1] === "MAX" ? "" : fromUnit(filter[kind][1]));
  }, [filter[kind]]);

  return (
    <div className="flex justify-center items-center">
      <NumberFormat
        className="text-sm"
        classNameContainer="w-[6.9rem]"
        theme="space"
        placeholder={placeholderMin}
        customInput={Input}
        allowNegative={false}
        thousandsGroupStyle="thousand"
        decimalSeparator="."
        displayType="input"
        type="text"
        thousandSeparator={true}
        decimalScale={6}
        allowEmptyFormatting={true}
        value={min}
        onValueChange={({ formattedValue }) => setMin(formattedValue)}
        onKeyDown={(e) => e.key === "Enter" && setRange()}
      />
      <div className="mx-1 font-extrabold text-lg">-</div>
      <NumberFormat
        className="text-sm"
        classNameContainer="w-[6.9rem]"
        theme="space"
        placeholder={placeholderMax}
        customInput={Input}
        allowNegative={false}
        thousandsGroupStyle="thousand"
        decimalSeparator="."
        displayType="input"
        type="text"
        thousandSeparator={true}
        decimalScale={6}
        allowEmptyFormatting={true}
        value={max}
        onValueChange={({ formattedValue }) => setMax(formattedValue)}
        onKeyDown={(e) => e.key === "Enter" && setRange()}
      />
      <FlatButton size="sm" className="ml-auto" onClick={setRange}>
        <ArrowRightShort size={20} className="stroke-white stroke-1" />
      </FlatButton>
    </div>
  );
};

type SortOption = {
  name: string;
  value: Order;
};

const sortOptions: SortOption[] = [
  {
    name: "Id: Low to high",
    value: "ASC_ID",
  },
  {
    name: "Id: High to low",
    value: "DESC_ID",
  },
  {
    name: "Price: Low to high",
    value: "ASC_BUY",
  },
  {
    name: "Price: High to low",
    value: "DESC_BUY",
  },
  {
    name: "Bid: Low to high",
    value: "ASC_BID",
  },
  {
    name: "Bid: High to low",
    value: "DESC_BID",
  },
  {
    name: "Mint: Old to new",
    value: "ASC_MINT",
  },
  {
    name: "Mint: New to old",
    value: "DESC_MINT",
  },
];

export const SortSelection = ({ sort, setSort }) => {
  const getItem = (value: Order): SortOption =>
    sort
      ? sortOptions.find((option) => option.value === value)
      : sortOptions[0];
  return (
    <Select
      value={getItem(sort)}
      options={sortOptions}
      onChange={(option) => setSort({ sort: option.value })}
    />
  );
};

export const FilterPanel = ({
  filter,
  setTypes,
  setGadgets,
  setGadgetsCount,
  setBuyRange,
  setBidRange,
  setOnSale,
  setOnBid,
  clear,
}) => {
  const checkSale = Boolean(filter.onSale);
  const checkBid = Boolean(filter.onBid);

  return (
    <div className="lg:sticky w-full lg:top-0 pb-20 lg:p-6 lg:border-2 lg:border-l-0 lg:border-slate-900 lg:bg-slate-800 text-white lg:rounded-r-xl lg:h-[100vh] overflow-auto scrollbar-none">
      <div className="text-xl w-full font-bold mb-10 flex justify-left items-center">
        <FilterAlt size={24} className="mr-2" /> <div>Filters</div>
      </div>
      <Disclosure title="Types" theme="space">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TYPES_GADGETS_COUNT.types).map((entry, index) => (
            <FilterTile
              key={index}
              entry={entry}
              kind="type"
              filter={filter}
              setFilter={setTypes}
            />
          ))}
        </div>
      </Disclosure>
      <div className="h-6" />
      <Disclosure title="Gadgets" theme="space">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TYPES_GADGETS_COUNT.gadgets).map((entry, index) => (
            <FilterTile
              key={index}
              entry={entry}
              kind="gadget"
              filter={filter}
              setFilter={setGadgets}
              negate
            />
          ))}
        </div>
      </Disclosure>
      <div className="h-6" />
      <Disclosure title="Ranges" theme="space">
        <div>
          <div className="mb-3 text-md font-bold">Number of gadgets</div>
          <RangeFilter
            filter={filter}
            setFilter={setGadgetsCount}
            kind="gadgetsCount"
            placeholderMin="Min (0)"
            placeholderMax="Max (12)"
          />
          <div className="mb-3 mt-4 text-md font-bold">Price range</div>
          <RangeFilter
            filter={filter}
            setFilter={setBuyRange}
            kind="buyRange"
            placeholderMin="Min price"
            placeholderMax="Max price"
            adaConversion
          />
          <div className="mb-3 mt-4 text-md font-bold">Bid range</div>
          <RangeFilter
            filter={filter}
            setFilter={setBidRange}
            kind="bidRange"
            placeholderMin="Min bid"
            placeholderMax="Max bid"
            adaConversion
          />
        </div>
      </Disclosure>

      <div className="mt-8 flex justify-left items-center">
        <Checkbox
          checked={checkSale}
          onChange={(e) => setOnSale(e.target.checked)}
        />
        <div className="mx-4 font-bold">On sale</div>
      </div>
      <div className="mt-2 flex justify-left items-center">
        <Checkbox
          checked={checkBid}
          onChange={(e) => setOnBid(e.target.checked)}
        />
        <div className="mx-4 font-bold">Bids</div>
      </div>
      <div className="w-full flex justify-left mt-16">
        <Button size="sm" theme="rose" className="w-32" onClick={() => clear()}>
          Clear all
        </Button>
      </div>
    </div>
  );
};
