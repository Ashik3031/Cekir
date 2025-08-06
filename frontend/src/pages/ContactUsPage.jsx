import ContactUs from "../components/ContactUs";
import { Footer } from "../features/footer/Footer";
import { Navbar } from "../features/navigation/components/Navbar";

export const ContactUsPage = () => {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <ContactUs />
      </div>
      <Footer />
    </>
  );
};
