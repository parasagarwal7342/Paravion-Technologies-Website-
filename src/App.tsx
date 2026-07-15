import { useEffect } from 'react';
import { Route, Switch as WouterSwitch } from 'wouter';
import Home from './pages/Home';
import NotFound from './pages/not-found';
import { ToastProvider } from './components/ui/toast';

function App() {
  useEffect(() => {
    // Forcibly apply dark mode to root document
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ToastProvider>
      <WouterSwitch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </WouterSwitch>
    </ToastProvider>
  );
}

export default App;
