import { useStoreActions, useStoreState } from "easy-peasy";
import * as React from "react";
import { makeFilter, makeSearch, makeSort } from ".";
import { Card, NodeContent } from "../../components";

type GalleryProps = {
  array: NodeContent[] | null | undefined;
  filtering: { filter: Object; sort: Object; search: Object };
};

export const Gallery = ({ array, filtering }: GalleryProps) => {
  const [page, incrementPage] = [
    useStoreState<any>((state) => state.explore.page),
    useStoreActions<any>((actions) => actions.explore.incrementPage),
  ];
  const onChangeScroll = () => {
    /* Increment page size, when at the bottom of window */
    if (
      window.innerHeight + (window.scrollY || window.pageYOffset) >=
      document.body.offsetHeight - 800
    ) {
      incrementPage();
    }
  };
  React.useEffect(() => {
    window.addEventListener("scroll", onChangeScroll);
    window.addEventListener("resize", onChangeScroll);
    return () => {
      window.removeEventListener("scroll", onChangeScroll);
      window.removeEventListener("resize", onChangeScroll);
    };
  }, []);

  const { idSearch, filterSearch } = makeSearch(filtering.search);

  const filteredArray = array
    ? [...array]
        .filter(
          (node) =>
            (idSearch ? idSearch.includes(node.budId) : true) &&
            makeFilter(node, filtering.filter) &&
            (filterSearch ? makeFilter(node, filterSearch) : true)
        )
        .sort((a, b) => makeSort(a, b, filtering.sort))
    : [];

  return (
    <div className="flex flex-grow flex-col">
      <div className="mb-4 font-bold text-lg">
        {filteredArray.length.toLocaleString("en-EN")}{" "}
        {filteredArray.length === 1 ? "item" : "items"}
      </div>
      {filteredArray.length > 0 ? (
        <div className="grid grid-cols-main lg:grid-cols-mainLg gap-1 md:gap-2 overflow-hidden">
          {filteredArray.slice(0, page * 50 + 50).map((node, index) => (
            <Card highlightBuy key={index} node={node} />
          ))}
        </div>
      ) : (
        <div className="w-full h-full font-medium text-slate-500 flex justify-center items-center">
          No SpaceBud found :(
        </div>
      )}
    </div>
  );
};
