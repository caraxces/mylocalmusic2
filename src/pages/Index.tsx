
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Player from '@/components/Player';

const Index = () => {
  return (
    <div className="min-h-screen flex gradient-bg">
      <Sidebar />
      <MainContent />
      <Player />
    </div>
  );
};

export default Index;
