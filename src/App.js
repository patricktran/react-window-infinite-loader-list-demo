import React, { Component } from "react";
import { connect } from "react-redux";
import "./App.css";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Grid from "@material-ui/core/Grid";
import AutoSizer from "react-virtualized-auto-sizer";

const ITEM_WIDTH = 275;
const ITEM_HEIGHT = 200;

const ItemDisplay = ({ title }) => {
  const imagesrc = `//via.placeholder.com/90x90.png?text=${title}`;
  return (
    <div className="item">
      {title}
      <img alt={title} src={imagesrc} />
    </div>
  );
};

const RowItem = React.memo(function RowItem({ title, id }) {
  return (
    <Grid item key={id} className={"mui-grid-item"}>
      <ItemDisplay title={title} />
    </Grid>
  );
});

class App extends Component {
  infiniteLoaderRef = React.createRef();

  /*componentDidUpdate(prevProps) {
    if (!prevProps.reset && this.props.reset && this.infiniteLoaderRef.current) {
      this.infiniteLoaderRef.current.resetloadMoreItemsCache(true);
    }
  }*/

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

  render() {
    const { items } = this.props;
    console.log("items length", items);

    return (
      <div className="App">
        <AutoSizer>
          {({ height, width }) => {
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
                    <RowItem key={item.id} id={item.id} title={item.title} />
                  ))}
                </div>
              );
            };

            return (
              <InfiniteLoader
                ref={this.infiniteLoaderRef}
                isItemLoaded={index => {
                  const { items } = this.props;
                  const maxItemsPerRow = this.getItemsPerRow(width);
                  const allItemsLoaded =
                    this.generateIndexesForRow(
                      index,
                      maxItemsPerRow,
                      items.length
                    ).length > 0;
                  //return !hasMore || allItemsLoaded;
                  return allItemsLoaded;
                }}
                itemCount={rowCount}
                loadMoreItems={this.loadNextPage}
              >
                {({ onItemsRendered, ref }) => (
                  <List
                    className="mui-grid"
                    ref={ref}
                    height={height}
                    itemCount={rowCount}
                    itemSize={ITEM_HEIGHT}
                    onItemsRendered={onItemsRendered}
                    width={width}
                  >
                    {rowRenderer}
                  </List>
                )}
              </InfiniteLoader>
            );
          }}
        </AutoSizer>
      </div>
    );
  }

  /*RenderItem = ({ index, style }) => {
    const { items } = this.props;
    let content;
    if (!this.isItemLoaded(index)) {
      content = "Loading...";
    } else {
      content = items[index].title;
    }
    const imagesrc = `//via.placeholder.com/90x90.png?text=${content}`;
    return (
      <div className="item" style={style}>
        {content}::{index}
        <img alt={content} src={imagesrc} />
      </div>
    );
  };*/

  /*
   <AutoSizer>
          {({ height, width }) => {
            this.itemsPerRow = Math.floor(width / ITEM_SIZE);
            const rowCount = Math.ceil(itemCount / this.itemsPerRow);
            return (
              <InfiniteLoader
                isItemLoaded={this.isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={this.loadNextPage}
              >
                {({ onItemsRendered, ref }) => (
                  <Grid
                    columnCount={this.itemsPerRow}
                    columnWidth={ITEM_SIZE}
                    height={height}
                    rowCount={rowCount}
                    rowHeight={ITEM_HEIGHT}
                            width={width}
                            onItemsRendered={onItemsRendered}
                  >
                    {this.RenderCell}
                  </Grid>
                )}
              </InfiniteLoader>
            );
          }}
        </AutoSizer>
      */

  /*<List
                    className="List"
                    height={height}
                    itemCount={itemCount}
                    itemSize={ITEM_HEIGHT}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    width={width}
                  >
                    {this.RenderItem}
                  </List>*/

  /*const isRowLoaded = ({ index }) => {
            //console.log("IsRowLoaded", index)
            const fromIndex = index * this.itemsPerRow;
            const toIndex = Math.min(fromIndex + this.itemsPerRow, this.itemCount);

            for (let i = fromIndex; i < toIndex; i++) {
                if (!items[i]) {
                    return false;
                }
            }

            return true;
        }

        const ITEM_SIZE = 275;
        const ITEM_HEIGHT = 200;

        return (
            <div className="App">
                 <AutoSizer>
                    {({ height, width }) => {

                        this.itemsPerRow = Math.floor(width / ITEM_SIZE);      
                        const rowCount = Math.ceil(this.itemCount / this.itemsPerRow);

                        return <InfiniteLoader
                            isRowLoaded={isRowLoaded}
                            loadMoreRows={this.loadMoreItems}
                            rowCount={rowCount}
                            minimumBatchSize={Math.floor(30 / this.itemsPerRow)}
                            
                        >
                            {({ onRowsRendered, registerChild }) => (
                                <List
                                    ref={registerChild}
                                    onRowsRendered={onRowsRendered}
                                    height={height}
                                    width={width}
                                    rowHeight={ITEM_HEIGHT}
                                    rowCount={rowCount}
                                    rowRenderer={
                                        ({ index, key, style }) => {

                                            const renderItems = [];
                                            const fromIndex = index * this.itemsPerRow;
                                            const toIndex = Math.min(fromIndex + this.itemsPerRow, this.itemCount);

                                            for (let i = fromIndex; i < toIndex; i++) {
                                                const item = items[i];
                                                const title = item ? item.title : "Loading";

                                                renderItems.push(<ItemDisplay className="Item" key={i} index={i} title={title} />)
                                            }

                                            return (
                                                <div
                                                    className='Row'
                                                    key={key}
                                                    style={style}
                                                >
                                                    {renderItems}
                                                </div>
                                            )
                                        }}
                                />
                            )}
                        </InfiniteLoader>
                    }}
                </AutoSizer>




            </div>
        );
    }*/
}
const mapStateToProps = state => {
  //console.log("state", state)
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);