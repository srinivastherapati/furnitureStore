import { useContext, useState } from "react";
import Buttons from "./UI/Buttons";
import CartContext from "./Store/CartContext";
import AddVariantModal from "./AddVariantModal";

import EditIcon from "@mui/icons-material/Edit";
import { deleteProduct } from "./ServerRequests";

export default function MealItem({
  product,
  role,
  onEdit,
  isLoggedIn,
  setCurrentPage,
  onAddVariant,
}) {
  const cartContxt = useContext(CartContext);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Handle variant selection
  function handleVariantSelection(variant) {
    setSelectedVariant(variant);
  }

  function handleAddMeal() {
    if (!selectedVariant) {
      alert("Please select a variant before adding to the cart.");
      return;
    }

    cartContxt.addItems({
      ...product,
      quantity: 1,
      size: selectedVariant.size,
      dimension: selectedVariant.dimension,
      price: selectedVariant.price,
    });
    alert("Product Added to Cart");
  }

  function handleDelete() {
    try {
      let val = confirm("Are you sure you want to delete?");
      if (val === false) return;
      deleteProduct(product.id);
      alert("Deleted Product Successfully!");
      window.location.reload();
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  const toggleModal = () => setShowModal((prev) => !prev);

  return (
    <>
      <li className="meal-item">
        <article className="meal-card">
          <img src={product.imageUrl} alt={product.name} className="meal-image" />
          <div className="meal-details">
            <h3 className="meal-title">{product.name}</h3>
            <p className="meal-description">{product.description}</p>

            {/* Variants Section */}
            {product.productVariants && (
              <div className="variants-section">
                {product.productVariants.map((variant, index) => (
                  <button
                    key={index}
                    className={`variant-card ${
                      selectedVariant?.size === variant.size &&
                      selectedVariant?.dimension === variant.dimension
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleVariantSelection(variant)}
                  >
                   
                    <p>
                      <strong>Wood:</strong> {variant.dimension}
                    </p>
                    <p className="variant-price">${variant.price}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Admin Controls */}
            {role!="customer" && (
              <>
                <p className="total-stock">
                  <strong>Total Stock:</strong>{" "}
                  {product.productVariants.reduce(
                    (total, variant) => total + variant.stock,
                    0
                  )}
                </p>
                <div className="admin-actions">
                  <EditIcon onClick={() => onEdit(product)} aria-label="Edit" />
                  <button onClick={toggleModal} className="add-variant-button">
                    Add Variant
                  </button>
                </div>
              </>
            )}

            {/* Add to Cart Button */}
            {role==="customer" && (
              <Buttons onClick={handleAddMeal}>
                {selectedVariant?.stock <= 0 ? "Out of Stock" : "+ Add to Cart"}
              </Buttons>
            )}
          </div>
        </article>
      </li>

      {showModal && (
        <AddVariantModal
          product={product}
          onClose={toggleModal}
          onAddVariant={onAddVariant}
        />
      )}

      <style jsx>{`
        .meal-item {
          list-style: none;
          margin: 20px;
        }

        .meal-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          background-color: white;
          transition: transform 0.3s ease;
          border: 2px solid #ddd;
        }

        .meal-card:hover {
          transform: translateY(-5px);
        }

        .meal-image {
          width: 100%;
          max-width: 300px;
          border-radius: 10px;
        }

        .meal-details {
          padding: 15px;
        }

        .meal-title {
          font-size: 1.5rem;
          color: #333;
        }

        .meal-description {
          font-size: 1rem;
          color: #555;
        }

        .variants-section {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }

        .variant-card {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .variant-card:hover {
          background-color: #f0f0f0;
        }

        .selected {
          border: 2px solid #007bff;
          background-color: #e7f3ff;
        }

        .variant-price {
          color: #ff5733;
          font-weight: bold;
        }

        .total-stock {
          font-size: 1.2rem;
          color: #333;
          margin-top: 10px;
        }

        .admin-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .add-variant-button {
          background-color: #007bff;
          color: white;
          padding: 8px 12px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .add-variant-button:hover {
          background-color: #0056b3;
        }

        @media (max-width: 768px) {
          .meal-card {
            flex-direction: column;
            align-items: center;
          }

          .variants-section {
            flex-direction: column;
          }

          .variant-card {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
