import { Route, Switch as WouterSwitch } from 'wouter';
import Home from './pages/Home';
import OrderPortal from './pages/OrderPortal';
import NotFound from './pages/not-found';
import { ToastProvider } from './components/ui/toast';

function App() {
  return (
    <ToastProvider>
      <WouterSwitch>
        <Route path="/" component={Home} />
        <Route path="/order" component={OrderPortal} />
        <Route component={NotFound} />
      </WouterSwitch>
    </ToastProvider>
  );
}

export default App;
