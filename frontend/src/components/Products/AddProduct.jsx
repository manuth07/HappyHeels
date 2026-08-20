import React, { useState } from "react";
import API from "../../axios";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      alert("Please login first");
      window.location.href = '/login';
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'ROLE_ADMIN') {
        alert("Only administrators can add products");
        return;
      }
    } catch (e) {
      alert("Invalid user data. Please login again.");
      window.location.href = '/login';
      return;
    }
    
    API
      .post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      })
      .then((response) => {
        alert("Product added successfully!");
        setProduct({
          name: "",
          brand: "",
          description: "",
          price: "",
          category: "",
          stockQuantity: "",
          releaseDate: "",
          productAvailable: false,
        });
        setImage(null);
      })
      .catch((error) => {
        console.error("Full error:", error);
        alert("Error adding product: " + (error.response?.data?.message || error.message));
      });
  };

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "68px", marginBottom: "50px" }}>
      <div className="border rounded-3 p-4 bg-white">
        <h2 className="section-title mb-4 border-bottom pb-3">Add New Product</h2>
        <form className="row g-3" onSubmit={submitHandler}>
          <div className="col-md-6">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Leather Heel Boots"
              onChange={handleInputChange}
              value={product.name}
              name="name"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Brand *</label>
            <input
              type="text"
              name="brand"
              className="form-control"
              placeholder="e.g. Happy Heels Premium"
              value={product.brand}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Detailed description of the footwear item"
              value={product.description}
              name="description"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Price (LKR) *</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 4500"
              onChange={handleInputChange}
              value={product.price}
              name="price"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={product.category}
              onChange={handleInputChange}
              name="category"
              required
            >
              <option value="">Select Category</option>
              <option value="Gents">Gents</option>
              <option value="Ladies">Ladies</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Stock Quantity *</label>
            <input
              type="number"
              className="form-control"
              placeholder="Stock count"
              onChange={handleInputChange}
              value={product.stockQuantity}
              name="stockQuantity"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Release Date</label>
            <input
              type="date"
              className="form-control"
              value={product.releaseDate}
              name="releaseDate"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Product Image *</label>
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
              required
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="productAvailable"
                id="gridCheck"
                checked={product.productAvailable}
                onChange={(e) =>
                  setProduct({ ...product, productAvailable: e.target.checked })
                }
              />
              <label className="form-check-label fw-medium" htmlFor="gridCheck">
                Product Available for Purchase
              </label>
            </div>
          </div>
          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Submit Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
