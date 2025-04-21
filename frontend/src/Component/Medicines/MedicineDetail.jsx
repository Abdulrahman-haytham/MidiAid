import { useParams } from "react-router";
import { useAddToCartMutation, useGetByIdQuery } from "../../redux/feature/api/Api";
import { Container, Row, Col, Card, Image, Spinner, Alert } from "react-bootstrap";
import img from '../../assets/pro12.png';
import { toast, ToastContainer } from "react-toastify";
import { Fade } from "react-awesome-reveal";

export default function MedicineDetail() {
  const { productId } = useParams();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const { data, error, isLoading } = useGetByIdQuery(`products/${productId}`);
  const product = data?.product;

  if (isLoading) return (
    <Container>
      <Row style={{ height: '85vh' }} className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </Row>
    </Container>
  );

  if (error) return (
    <Container>
      <Row style={{ height: '85vh' }} className="d-flex justify-content-center align-items-center py-5">
        <Alert variant="danger" className="w-50 text-center">
          Failed to fetch product data!
        </Alert>
      </Row>
    </Container>
  );

  const handleCart = async () => {
    try {
      await addToCart(productId).unwrap();
      toast.success('Product added to cart successfully!');
      console.log('Added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart!');
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <Container>
      <Row className="py-5" style={{ minHeight: '100vh' }}>
        {/* Product Image */}
        <Col xs={12} md={6} lg={7} className=" mb-md-0">
         <div className="img-detail">
         <Image
            src={img}
            className="rounded m-auto"
            alt="product"
            style={{ height: "100%", width: "90%", objectFit: "cover" }}
          />
         </div>
        </Col>

        {/* Product Details */}
        <Col xs={12} md={6} lg={5}>
          <Fade
                  style={{ margin: "auto" }}
                  delay={300}
                  direction="right"
                  triggerOnce={true}
                  cascade
          >
              <Card.Body>
            <h1 className="title-datail text-center text-danger">{product?.name || "Not Available"}</h1>

            <div className="txt-detail">
              <span className="ps-3">Brand:</span>
              <span className="text-secondary ps-2">{product?.brand || "Not Available"}</span>
            </div>

            <div className="txt-detail">
              <span className="ps-3">Category:</span>
              <span className="text-secondary ps-2">{product?.category || "Not Available"}</span>
            </div>

            <div className="txt-detail">
              <span className="ps-3">Sub Category:</span>
              <span className="text-secondary ps-2">{product?.sub_category || "Not Available"}</span>
            </div>

            <div className="txt-detail">
              <span className="ps-3">Quantity:</span>
              <span className="text-secondary ps-2">{product?.quantity || "Not Available"}</span>
            </div>

            <div className="txt-detail">
              <span className="ps-3">Price:</span>
              <span className="text-secondary ps-2">
                {product?.price ? (
                  <>
                  {/* text-decoration-line-through */}
                    <span className="">{product.price}</span>
                    <span className="text-success"> L.C</span>
                  </>
                ) : "Not Available"}
              </span>
            </div>
          </Card.Body>

          {/* Product Description */}
          <div className="txt-detail overflow-auto" style={{ maxHeight: "200px", padding: '0 15px' }}>
            <p className="ps-3">{product?.description || "No description available for this product."}</p>
          </div>

          {/* Add to Cart Button */}
          <button 
            className="btn-submit mt-4 w-100" 
            onClick={handleCart} 
            disabled={isAdding}
            >
            {isAdding ? (
              <Spinner animation="border" size="sm" variant="light" />
            ) : (
              "Add To Cart"
            )}
          </button>
          </Fade>
        </Col>
      </Row>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </Container>
  );
}
