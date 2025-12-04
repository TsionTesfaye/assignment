import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    let isMounted = true;

    const loadItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items/${id}`, {
          signal: abortControllerRef.current.signal
        });
        if (!res.ok) {
          throw new Error('Item not found');
        }
        const data = await res.json();
        if (isMounted) {
          setItem(data);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Failed to fetch item:', error);
          navigate('/');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container detail-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="container detail-container">
      <div className="back-button">
        <Link to="/">
          <button className="ghost">← Back to Items</button>
        </Link>
      </div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title" style={{ fontSize: '32px' }}>{item.name}</h1>
        </div>
        <div>
          <div className="detail-section">
            <div className="detail-label">Category</div>
            <div className="detail-value">{item.category}</div>
          </div>
          <div className="detail-section">
            <div className="detail-label">Price</div>
            <div className="detail-price">${item.price}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;