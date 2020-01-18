import React, { Component, useEffect } from "react";
import { connect } from "react-redux";
import "./App.css";
import { VariableSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Grid from "@material-ui/core/Grid";
import AutoSizer from "react-virtualized-auto-sizer";
import { WindowScroller } from "react-virtualized";

const ITEM_WIDTH = 275;
const ITEM_HEIGHT = 200;

const ItemDisplay = React.forwardRef(({ title, description }, ref) => {
  const imagesrc = `//via.placeholder.com/90x90.png?text=${title}`;

  return (
    <div ref={ref} className="item">
      <span>{title}</span>
      <img alt={title} src={imagesrc} />
      <span>{description}</span>
    </div>
  );
});

const RowItem = React.memo(function RowItem({
  title,
  description,
  id,
  rowIndex,
  setRowSize,
  windowWidth
}) {
  const itemRef = React.useRef();

  useEffect(() => {
    setRowSize(rowIndex, itemRef.current.getBoundingClientRect().height);
  }, [windowWidth]);

  return (
    <div className="bordered">
      <Grid item key={id} className={"mui-grid-item"}>
        <ItemDisplay ref={itemRef} title={title} description={description} />
      </Grid>
    </div>
  );
});

class App extends Component {
  infiniteLoaderRef = React.createRef();
  listRef = React.createRef();
  maxWidth = 0;

  rowSizeMap = {};

  setRowSize = (index, size) => {
    // console.log("setting", index, size);
    if (this.rowSizeMap[index]) {
      if (this.rowSizeMap[index] < size) {
        this.rowSizeMap[index] = size;
        this.listRef.current.resetAfterIndex(index); //https://react-window.now.sh/#/api/VariableSizeList
      }
    } else {
      this.rowSizeMap[index] = size;
      this.listRef.current.resetAfterIndex(index);
    }
  };

  componentDidMount() {
    //load first set
    this.props.loadMore();
  }

  loadNextPage = () => {
    if (!this.props.isFetching) {
      this.props.loadMore();
    }
  };

  getItemsPerRow = width => {
    return Math.max(Math.floor(width / ITEM_WIDTH), 1);
  };

  getNumberOfRows = (width, itemsAmount, hasMore = true) => {
    const maxItemsPerRow = this.getItemsPerRow(width);

    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    return Math.ceil(itemsAmount / maxItemsPerRow) + (hasMore ? 1 : 0);
  };

  getRowHeight = index => {
    return this.rowSizeMap[index] || ITEM_HEIGHT;
  };

  generateIndexesForRow = (rowIndex, maxItemsPerRow, itemsAmount) => {
    const result = [];
    const startIndex = rowIndex * maxItemsPerRow;

    for (
      let i = startIndex;
      i < Math.min(startIndex + maxItemsPerRow, itemsAmount);
      i++
    ) {
      result.push(i);
    }

    return result;
  };

  //hack to use react virtualized window scroller with react window
  handleScroll = ({ scrollTop }) => {
    if (this.listRef.current) {
      this.listRef.current.scrollTo(scrollTop);
    }
  };

  render() {
    const { items } = this.props;

    return (
      <div className="App">
        <WindowScroller onScroll={this.handleScroll}>
          {() => null}
        </WindowScroller>
        <AutoSizer>
          {({ height, width }) => {
            this.maxWidth = width;
            const rowCount = this.getNumberOfRows(width, items.length, true);

            const rowRenderer = ({ index, style }) => {
              const { items } = this.props;
              const maxItemsPerRow = this.getItemsPerRow(width);

              const itemsToRender = this.generateIndexesForRow(
                index,
                maxItemsPerRow,
                items.length
              ).map(index => items[index]);

              return (
                <div style={style} className={"mui-row"}>
                  {itemsToRender.map(item => (
                    <RowItem
                      windowWidth={width}
                      rowIndex={index}
                      setRowSize={this.setRowSize}
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              );
            };

            return (
              <InfiniteLoader
                threshold={5}
                isItemLoaded={index => {
                  const { items } = this.props;
                  const maxItemsPerRow = this.getItemsPerRow(width);
                  const allItemsLoaded =
                    this.generateIndexesForRow(
                      index,
                      maxItemsPerRow,
                      items.length
                    ).length > 0;
              
                  return allItemsLoaded;
                }}
                itemCount={rowCount}
                loadMoreItems={this.loadNextPage}
              >
                {({ onItemsRendered, ref }) => {
                  return (
                    <List
                      className="mui-grid"
                      ref={this.listRef}
                      height={height}
                      itemCount={rowCount}
                      estimatedItemSize={ITEM_HEIGHT}
                      itemSize={this.getRowHeight}
                      onItemsRendered={onItemsRendered}
                      width={width}
                    >
                      {rowRenderer}
                    </List>
                  );
                }}
              </InfiniteLoader>
            );
          }}
        </AutoSizer>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    items: state.items,
    isFetching: state.isFetching
  };
};

const mapDispatchToProps = dispatch => ({
  loadMore: () =>
    dispatch({
      type: "LOAD_MORE"
    })
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
