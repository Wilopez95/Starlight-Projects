import { Header } from '@root/components/Layout';
import Footer from '@root/components/Footer';
import routes from './ReportsRoutes';

const ReportsLayout = () => (
  <div data-name="reports-layout">
    <Header />
    <div className="page page--reports">{routes}</div>
    <Footer />
  </div>
);

export default ReportsLayout;
