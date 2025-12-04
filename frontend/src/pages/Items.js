import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, total, loading, fetchItems } = useData();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const abortControllerRef = useRef(null);
  const limit = 20;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items with proper cleanup to prevent memory leaks (#RECHECK LATER)
  useEffect(() => {
    // cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // reate new abort controller for this request
    abortControllerRef.current = new AbortController();
    let isMounted = true;

    const loadItems = async () => {
      try {
        await fetchItems(page, limit, debouncedQuery);
        //update if component is still mounted
        if (!isMounted) return;
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Failed to fetch items:', error);
        }
      }
    };

    loadItems();

    // cleanup
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [page, debouncedQuery, fetchItems]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / limit);

  // Virtualized list item renderer
  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    if (!item) return null;

    // Calculate item number (considering pagination... and search results)
    const itemNumber = (page - 1) * limit + index + 1;

    return (
      <div style={style} className="item-row">
        <Link to={`/items/${item.id}`} className="item-link">
          <div className="item-name">
            <span className="item-number">{itemNumber}.</span> {item.name}
          </div>
          <div className="item-meta">{item.category} • ${item.price}</div>
        </Link>
      </div>
    );
  }, [items, page, limit]);

  //Skeleton row for loading state (10 products for now)
  const SkeletonRow = useCallback(({ index, style }) => {
    return (
      <div style={style} className="item-row skeleton-row">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-meta"></div>
      </div>
    );
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Items</h1>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {loading && items.length === 0 ? (
          <div className="item-list">
            <FixedSizeList
              height={600}
              itemCount={10}
              itemSize={80}
              width="100%"
            >
              {SkeletonRow}
            </FixedSizeList>
          </div>
        ) : items.length === 0 ? (
          <div className="empty">No items found</div>
        ) : (
          <div className="item-list">
            <FixedSizeList
              height={600}
              itemCount={items.length}
              itemSize={80}
              width="100%"
            >
              {Row}
            </FixedSizeList>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Items;