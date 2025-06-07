
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { KPICards } from '@/components/KPICards';
import { ActivityChart } from '@/components/ActivityChart';
import { TaskList } from '@/components/TaskList';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect happening
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-4">
            <div className="mb-4">
              <SidebarTrigger />
            </div>
            
            <div className="max-w-7xl mx-auto space-y-6">
              <DashboardHeader />
              <KPICards />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ActivityChart />
                <TaskList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
