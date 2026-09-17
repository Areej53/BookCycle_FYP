import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiBookOpen, FiShoppingBag, FiRepeat, FiTruck, FiShield } from 'react-icons/fi';

const PALETTE = {
  primary: '#13493C',
  secondary: '#606C38',
  cta: '#BC6C25',
  bg: '#FCFAF0',
  card: '#FFFFFF',
  text: '#2B3A35',
  muted: '#5C6B65',
  border: '#E9E5D3',
  accent: '#DDA15E',
};

const SectionCard = ({ icon, title, children }) => (
  <div style={{
    background: PALETTE.card,
    border: `1.5px solid ${PALETTE.border}`,
    borderRadius: '18px',
    padding: '24px 28px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'rgba(19, 73, 60, 0.08)',
        color: PALETTE.primary,
        display: 'grid',
        placeItems: 'center',
        fontSize: '1.2rem',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.25rem',
        fontWeight: 700,
        color: PALETTE.primary,
        margin: 0,
      }}>
        {title}
      </h3>
    </div>
    <div style={{ color: PALETTE.text, fontSize: '0.92rem', lineHeight: 1.65 }}>
      {children}
    </div>
  </div>
);

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: PALETTE.bg }}>
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* Breadcrumb & Title Banner */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.8rem', color: PALETTE.muted, marginBottom: '12px' }}>
            <span style={{ cursor: 'pointer', color: PALETTE.secondary, fontWeight: 600 }} onClick={() => navigate('/')}>Home</span>
            <span>›</span>
            <span style={{ color: PALETTE.primary, fontWeight: 700 }}>Terms of Service</span>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${PALETTE.primary} 0%, #1c5e4e 100%)`,
            borderRadius: '24px',
            padding: '36px 32px',
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(19, 73, 60, 0.15)',
          }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: PALETTE.accent,
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              Legal & Policy
            </span>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              marginTop: '12px',
              marginBottom: '8px',
              color: '#FFFFFF',
            }}>
              Terms of Service & Community Guidelines
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.6 }}>
              Welcome to BookCycle! Please review our Terms of Service covering Book Buying, Renting, Exchanging, Delivery, and Privacy.
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div>
          {/* Section 1: General Usage */}
          <SectionCard icon={<FiFileText size={20} />} title="1. General Platform Usage & Account Agreement">
            <p>
              By accessing or using the BookCycle platform, you agree to comply with all applicable terms, policies, and community standards.
              Users are responsible for maintaining the accuracy of their account details and for all activities conducted under their profile.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li style={{ marginBottom: '6px' }}>BookCycle serves as a platform connecting book buyers, renters, and exchange partners in Islamabad.</li>
              <li style={{ marginBottom: '6px' }}>Fraudulent listings, inaccurate condition descriptions, or abusive behavior will result in account suspension.</li>
            </ul>
          </SectionCard>

          {/* Section 2: Book Rental Policy */}
          <SectionCard icon={<FiBookOpen size={20} />} title="2. Book Rental Policy & Conditions">
            <p style={{ fontWeight: 600, color: PALETTE.primary, marginBottom: '8px' }}>
              When placing an order for a rented book, you explicitly agree to the following binding conditions:
            </p>
            <div style={{ background: '#F7F9F8', border: `1px solid ${PALETTE.border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
              <ul style={{ paddingLeft: '18px', margin: 0 }}>
                <li style={{ marginBottom: '10px' }}>
                  <strong>Condition Maintenance:</strong> You promise to return the rented book in the exact condition as received, free of physical damage, highlighting, margin notes, or torn pages.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <strong>Return Deadline:</strong> You agree to return the book strictly within the selected rental duration (e.g. 3 Months, 6 Months, or 1 Year).
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <strong>Replacement & Compensation Fee:</strong> In case of lost, stolen, or severely damaged books, standard replacement or market compensation charges will be billed to the buyer.
                </li>
                <li>
                  <strong>Owner / Seller Approval:</strong> Rental requests are finalized after seller acceptance.
                </li>
              </ul>
            </div>
          </SectionCard>

          {/* Section 3: Book Buying Policy */}
          <SectionCard icon={<FiShoppingBag size={20} />} title="3. Book Purchase & Order Fulfillment">
            <p>
              Purchases made on BookCycle are direct orders placed with individual book owners/sellers. Prices listed represent the full purchase price set by the seller, excluding delivery charges.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li style={{ marginBottom: '6px' }}>Once an order is submitted, it is sent to the seller for confirmation.</li>
              <li style={{ marginBottom: '6px' }}>All books are verified for condition descriptions as stated by the seller.</li>
            </ul>
          </SectionCard>

          {/* Section 4: Book Exchange Policy */}
          <SectionCard icon={<FiRepeat size={20} />} title="4. Book Exchange Terms">
            <p>
              BookCycle facilitates book-for-book exchange requests between readers.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li style={{ marginBottom: '6px' }}>Exchange requests must be accepted by the recipient book owner.</li>
              <li style={{ marginBottom: '6px' }}>Delivery fees for exchange requests cover physical courier logistics in Islamabad.</li>
            </ul>
          </SectionCard>

          {/* Section 5: Delivery & Payments */}
          <SectionCard icon={<FiTruck size={20} />} title="5. Delivery & Payment Method Policy">
            <p>
              Delivery services are currently available across designated sectors in Islamabad within 1–2 working days.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li style={{ marginBottom: '6px' }}><strong>Delivery Fee:</strong> Standard delivery charge of Rs. 120 applies per seller item.</li>
              <li style={{ marginBottom: '6px' }}><strong>Payments:</strong> Payment details (e.g., EasyPaisa) are processed safely according to seller instructions.</li>
            </ul>
          </SectionCard>

          {/* Section 6: Privacy Policy */}
          <SectionCard icon={<FiShield size={20} />} title="6. Privacy Policy & Data Protection">
            <p>
              Your privacy is fundamental to BookCycle. We collect only necessary delivery and account details (Name, Phone Number, Shipping Address) required to fulfill your orders.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li style={{ marginBottom: '6px' }}>We never sell or distribute your personal data to unauthorized third parties.</li>
              <li style={{ marginBottom: '6px' }}>Shipping details are shared securely only with your order's delivery rider.</li>
            </ul>
          </SectionCard>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
