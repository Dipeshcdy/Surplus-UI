import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings as SettingsIcon, 
  UserCheck, 
  MessageSquare, 
  Briefcase,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Tags
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: number;
  category: string;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Registration {
  id: number;
  course_id: number;
  course_title: string;
  full_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image_url: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  id: number;
  client_name: string;
  content: string;
  rating: number;
}

interface SiteSettings {
  site_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  hero_title: string;
  hero_subtitle: string;
}

interface Stats {
  totalCourses: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  teamMembers: number;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-zinc-900 text-white shadow-lg' 
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
  </button>
);

const Card = ({ children, title, action }: { children: React.ReactNode, title?: string, action?: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
    {(title || action) && (
      <div className="px-6 py-4 border-bottom border-zinc-100 flex justify-between items-center">
        {title && <h3 className="font-semibold text-zinc-900">{title}</h3>}
        {action}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, trend }: { label: string, value: string | number, icon: any, trend?: string }) => (
  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-zinc-900 mb-1">{value}</div>
    <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{label}</div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Course View State
  const [courseView, setCourseView] = useState<'list' | 'create' | 'edit' | 'view' | 'delete'>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Team View State
  const [teamView, setTeamView] = useState<'list' | 'create' | 'edit' | 'delete'>('list');
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [teamMemberToDelete, setTeamMemberToDelete] = useState<TeamMember | null>(null);

  // Service View State
  const [serviceView, setServiceView] = useState<'list' | 'create' | 'edit' | 'delete'>('list');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Testimonial View State
  const [testimonialView, setTestimonialView] = useState<'list' | 'create' | 'edit' | 'delete'>('list');
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

  // Category View State
  const [categoryView, setCategoryView] = useState<'list' | 'create' | 'edit' | 'delete'>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes, regsRes, settingsRes, teamRes, servicesRes, testimonialsRes, categoriesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/courses'),
        fetch('/api/registrations'),
        fetch('/api/settings'),
        fetch('/api/team'),
        fetch('/api/services'),
        fetch('/api/testimonials'),
        fetch('/api/categories')
      ]);
      
      setStats(await statsRes.json());
      setCourses(await coursesRes.json());
      setRegistrations(await regsRes.json());
      setSettings(await settingsRes.json());
      setTeam(await teamRes.json());
      setServices(await servicesRes.json());
      setTestimonials(await testimonialsRes.json());
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const method = courseView === 'create' ? 'POST' : 'PUT';
    const url = courseView === 'create' ? '/api/courses' : `/api/courses/${selectedCourse?.id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setCourseView('list');
        fetchData();
      }
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const deleteCourse = async (id: number) => {
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      setCourseToDelete(null);
      setCourseView('list');
      fetchData();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const updateRegistrationStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error("Error updating registration:", error);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        fetchData();
        alert("Settings updated successfully!");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const method = teamView === 'create' ? 'POST' : 'PUT';
    const url = teamView === 'create' ? '/api/team' : `/api/team/${selectedTeamMember?.id}`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setTeamView('list');
      fetchData();
    } catch (error) {
      console.error("Error saving team member:", error);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const method = serviceView === 'create' ? 'POST' : 'PUT';
    const url = serviceView === 'create' ? '/api/services' : `/api/services/${selectedService?.id}`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setServiceView('list');
      fetchData();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const method = testimonialView === 'create' ? 'POST' : 'PUT';
    const url = testimonialView === 'create' ? '/api/testimonials' : `/api/testimonials/${selectedTestimonial?.id}`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setTestimonialView('list');
      fetchData();
    } catch (error) {
      console.error("Error saving testimonial:", error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const method = categoryView === 'create' ? 'POST' : 'PUT';
    const url = categoryView === 'create' ? '/api/categories' : `/api/categories/${selectedCategory?.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error saving category");
        return;
      }
      setCategoryView('list');
      fetchData();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      setCategoryToDelete(null);
      setCategoryView('list');
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const deleteTeamMember = async (id: number) => {
    try {
      await fetch(`/api/team/${id}`, { method: 'DELETE' });
      setTeamMemberToDelete(null);
      setTeamView('list');
      fetchData();
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  const deleteService = async (id: number) => {
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      setServiceToDelete(null);
      setServiceView('list');
      fetchData();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const deleteTestimonial = async (id: number) => {
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      setTestimonialToDelete(null);
      setTestimonialView('list');
      fetchData();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const renderTeam = () => {
    if (teamView === 'create' || teamView === 'edit') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setTeamView('list')} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-zinc-900">
              {teamView === 'create' ? 'Add Team Member' : 'Edit Team Member'}
            </h2>
          </div>
          <Card>
            <form onSubmit={handleTeamSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                  <input name="name" required defaultValue={selectedTeamMember?.name} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Role</label>
                  <input name="role" required defaultValue={selectedTeamMember?.role} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Image URL</label>
                <input name="image_url" defaultValue={selectedTeamMember?.image_url} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bio</label>
                <textarea name="bio" required defaultValue={selectedTeamMember?.bio} rows={4} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button type="button" onClick={() => setTeamView('list')} className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-bold hover:bg-zinc-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold hover:bg-zinc-800 shadow-lg">
                  {teamView === 'create' ? 'Add Member' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    if (teamView === 'delete') {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900">Remove Team Member?</h2>
                <p className="text-zinc-500 text-lg">Are you sure you want to remove <span className="text-zinc-900 font-bold">"{teamMemberToDelete?.name}"</span>?</p>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setTeamView('list')} className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200">Cancel</button>
                <button onClick={() => teamMemberToDelete && deleteTeamMember(teamMemberToDelete.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg">Delete Permanently</button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-zinc-900">Team Management</h2>
          <button onClick={() => { setSelectedTeamMember(null); setTeamView('create'); }} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 shadow-lg">
            <Plus size={18} /> Add Member
          </button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Member</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Role</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {team.map((member) => (
                  <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                          <img src={member.image_url || `https://picsum.photos/seed/${member.id}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="font-bold text-zinc-900">{member.name}</div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-zinc-600">{member.role}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedTeamMember(member); setTeamView('edit'); }} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => { setTeamMemberToDelete(member); setTeamView('delete'); }} className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderServices = () => {
    if (serviceView === 'create' || serviceView === 'edit') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setServiceView('list')} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-zinc-900">
              {serviceView === 'create' ? 'Add Service' : 'Edit Service'}
            </h2>
          </div>
          <Card>
            <form onSubmit={handleServiceSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Service Title</label>
                <input name="title" required defaultValue={selectedService?.title} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Icon Name (Lucide)</label>
                <input name="icon" required defaultValue={selectedService?.icon} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="e.g. Briefcase, Globe, Users" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea name="description" required defaultValue={selectedService?.description} rows={4} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button type="button" onClick={() => setServiceView('list')} className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-bold hover:bg-zinc-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold hover:bg-zinc-800 shadow-lg">
                  {serviceView === 'create' ? 'Add Service' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    if (serviceView === 'delete') {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900">Delete Service?</h2>
                <p className="text-zinc-500 text-lg">Are you sure you want to delete <span className="text-zinc-900 font-bold">"{serviceToDelete?.title}"</span>?</p>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setServiceView('list')} className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200">Cancel</button>
                <button onClick={() => serviceToDelete && deleteService(serviceToDelete.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg">Delete Permanently</button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-zinc-900">Services Management</h2>
          <button onClick={() => { setSelectedService(null); setServiceView('create'); }} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 shadow-lg">
            <Plus size={18} /> Add Service
          </button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Service</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {services.map((service) => (
                  <tr key={service.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-zinc-900">{service.title}</div>
                      <div className="text-xs text-zinc-500 line-clamp-1">{service.description}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedService(service); setServiceView('edit'); }} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => { setServiceToDelete(service); setServiceView('delete'); }} className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderTestimonials = () => {
    if (testimonialView === 'create' || testimonialView === 'edit') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setTestimonialView('list')} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-zinc-900">
              {testimonialView === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}
            </h2>
          </div>
          <Card>
            <form onSubmit={handleTestimonialSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Client Name</label>
                  <input name="client_name" required defaultValue={selectedTestimonial?.client_name} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Rating (1-5)</label>
                  <input name="rating" type="number" min="1" max="5" required defaultValue={selectedTestimonial?.rating} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Content</label>
                <textarea name="content" required defaultValue={selectedTestimonial?.content} rows={4} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button type="button" onClick={() => setTestimonialView('list')} className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-bold hover:bg-zinc-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold hover:bg-zinc-800 shadow-lg">
                  {testimonialView === 'create' ? 'Add Testimonial' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    if (testimonialView === 'delete') {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900">Delete Testimonial?</h2>
                <p className="text-zinc-500 text-lg">Are you sure you want to delete testimonial from <span className="text-zinc-900 font-bold">"{testimonialToDelete?.client_name}"</span>?</p>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setTestimonialView('list')} className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200">Cancel</button>
                <button onClick={() => testimonialToDelete && deleteTestimonial(testimonialToDelete.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg">Delete Permanently</button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-zinc-900">Testimonials Management</h2>
          <button onClick={() => { setSelectedTestimonial(null); setTestimonialView('create'); }} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 shadow-lg">
            <Plus size={18} /> Add Testimonial
          </button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Client</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Rating</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {testimonials.map((t) => (
                  <tr key={t.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-zinc-900">{t.client_name}</div>
                      <div className="text-xs text-zinc-500 line-clamp-1">{t.content}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: t.rating }).map((_, i) => <span key={i}>★</span>)}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedTestimonial(t); setTestimonialView('edit'); }} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => { setTestimonialToDelete(t); setTestimonialView('delete'); }} className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-zinc-900">Dashboard Overview</h2>
        <p className="text-zinc-500">Welcome back! Here's what's happening with Surplus today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Courses" value={stats?.totalCourses || 0} icon={BookOpen} trend="+2 this month" />
        <StatCard label="Total Registrations" value={stats?.totalRegistrations || 0} icon={UserCheck} trend="+12% vs last month" />
        <StatCard label="Pending Approval" value={stats?.pendingRegistrations || 0} icon={Clock} />
        <StatCard label="Team Members" value={stats?.teamMembers || 0} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Recent Registrations" action={<button onClick={() => setActiveTab('registrations')} className="text-sm font-bold text-zinc-900 hover:underline">View All</button>}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Student</th>
                    <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Course</th>
                    <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {registrations.slice(0, 5).map((reg) => (
                    <tr key={reg.id}>
                      <td className="py-4">
                        <div className="font-bold text-zinc-900">{reg.full_name}</div>
                        <div className="text-[10px] text-zinc-400">{reg.email}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-zinc-600">{reg.course_title}</div>
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          reg.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => { setActiveTab('courses'); setCourseView('create'); }} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-all text-left">
                <div className="p-2 bg-zinc-900 text-white rounded-lg"><Plus size={18} /></div>
                <div>
                  <div className="text-sm font-bold">Add Course</div>
                  <div className="text-[10px] text-zinc-400">Create a new offering</div>
                </div>
              </button>
              <button onClick={() => setActiveTab('settings')} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-all text-left">
                <div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg"><SettingsIcon size={18} /></div>
                <div>
                  <div className="text-sm font-bold">Site Settings</div>
                  <div className="text-[10px] text-zinc-400">Update contact info</div>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => {
    if (courseView === 'create' || courseView === 'edit') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCourseView('list')} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-zinc-900">
              {courseView === 'create' ? 'Add New Course' : 'Edit Course'}
            </h2>
          </div>
          
          <Card>
            <form onSubmit={handleCourseSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Course Title</label>
                  <input name="title" required defaultValue={selectedCourse?.title} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="e.g. Advanced Business Strategy" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                  <select name="category" required defaultValue={selectedCourse?.category} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Duration</label>
                  <input name="duration" required defaultValue={selectedCourse?.duration} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="e.g. 6 Weeks" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Price ($)</label>
                  <input name="price" type="number" step="0.01" required defaultValue={selectedCourse?.price} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="e.g. 499.99" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Image URL</label>
                <input name="image_url" defaultValue={selectedCourse?.image_url} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="https://example.com/image.jpg" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea name="description" required defaultValue={selectedCourse?.description} rows={6} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="Describe the course content and objectives..." />
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-zinc-100">
                <button type="button" onClick={() => setCourseView('list')} className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-bold hover:bg-zinc-200 transition-all">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold hover:bg-zinc-800 transition-all shadow-lg">
                  {courseView === 'create' ? 'Create Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    if (courseView === 'view') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCourseView('list')} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-zinc-900">Course Details</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="space-y-6">
                  {selectedCourse?.image_url && (
                    <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-80 object-cover rounded-xl shadow-sm" />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-zinc-900 mb-2">{selectedCourse?.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span className="bg-zinc-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">{selectedCourse?.category}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {selectedCourse?.duration}</span>
                    </div>
                  </div>
                  <div className="prose prose-zinc max-w-none">
                    <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{selectedCourse?.description}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card title="Quick Stats">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                    <span className="text-zinc-500 text-sm">Price</span>
                    <span className="text-xl font-bold text-zinc-900">${selectedCourse?.price}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                    <span className="text-zinc-500 text-sm">Duration</span>
                    <span className="font-semibold">{selectedCourse?.duration}</span>
                  </div>
                  <div className="pt-4 space-y-3">
                    <button onClick={() => setCourseView('edit')} className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2">
                      <Edit size={18} /> Edit Course
                    </button>
                    <button onClick={() => { setCourseToDelete(selectedCourse); }} className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2">
                      <Trash2 size={18} /> Delete Course
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    if (courseView === 'delete') {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900">Delete Course?</h2>
                <p className="text-zinc-500 text-lg">
                  Are you sure you want to permanently delete <span className="text-zinc-900 font-bold">"{courseToDelete?.title}"</span>?
                </p>
                <p className="text-rose-600 text-sm font-medium bg-rose-50 py-2 px-4 rounded-lg inline-block">
                  This action cannot be undone and will remove all associated data.
                </p>
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setCourseView('list')}
                  className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all"
                >
                  No, Keep Course
                </button>
                <button 
                  onClick={() => courseToDelete && deleteCourse(courseToDelete.id)}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-zinc-900">Course Management</h2>
          <button 
            onClick={() => { setSelectedCourse(null); setCourseView('create'); }}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-all shadow-lg"
          >
            <Plus size={18} /> Add New Course
          </button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Course</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Category</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Duration</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Price</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {courses.map((course) => (
                  <tr key={course.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                          {course.image_url ? (
                            <img src={course.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300"><BookOpen size={20}/></div>
                          )}
                        </div>
                        <div className="font-bold text-zinc-900 line-clamp-1">{course.title}</div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded uppercase tracking-wider">{course.category}</span>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-zinc-600 font-medium">{course.duration}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-zinc-900">${course.price}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedCourse(course); setCourseView('view'); }} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors" title="View">
                          <ChevronRight size={18} />
                        </button>
                        <button onClick={() => { setSelectedCourse(course); setCourseView('edit'); }} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { setCourseToDelete(course); setCourseView('delete'); }} className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && (
              <div className="text-center py-12 text-zinc-400 italic">No courses available.</div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderRegistrations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">Student Registrations</h2>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Student</th>
                <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Course</th>
                <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Contact</th>
                <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Date</th>
                <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Status</th>
                <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {registrations.map((reg) => (
                <tr key={reg.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-zinc-900">{reg.full_name}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-zinc-600 font-medium">{reg.course_title}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-xs text-zinc-500">{reg.email}</div>
                    <div className="text-xs text-zinc-400">{reg.phone}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-xs text-zinc-500">{new Date(reg.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      reg.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {reg.status === 'pending' && (
                        <>
                          <button onClick={() => updateRegistrationStatus(reg.id, 'approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => updateRegistrationStatus(reg.id, 'rejected')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {registrations.length === 0 && (
            <div className="text-center py-12 text-zinc-400 italic">No registrations found.</div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">Site Configuration</h2>
      
      <form onSubmit={handleSettingsUpdate}>
        <div className="space-y-8">
          <Card title="General Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Site Name</label>
                <input name="site_name" defaultValue={settings?.site_name} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Contact Email</label>
                <input name="contact_email" defaultValue={settings?.contact_email} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Contact Phone</label>
                <input name="contact_phone" defaultValue={settings?.contact_phone} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Office Address</label>
                <input name="address" defaultValue={settings?.address} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
              </div>
            </div>
          </Card>

          <Card title="Hero Section (Homepage)">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hero Title</label>
                <input name="hero_title" defaultValue={settings?.hero_title} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hero Subtitle</label>
                <textarea name="hero_subtitle" defaultValue={settings?.hero_subtitle} rows={3} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-xl">
              Save All Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderCategories = () => {
    if (categoryView === 'create' || categoryView === 'edit') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCategoryView('list')} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-zinc-900">
              {categoryView === 'create' ? 'Add Category' : 'Edit Category'}
            </h2>
          </div>
          <Card>
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Category Name</label>
                <input name="name" required defaultValue={selectedCategory?.name} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea name="description" defaultValue={selectedCategory?.description} rows={4} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button type="button" onClick={() => setCategoryView('list')} className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-bold hover:bg-zinc-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold hover:bg-zinc-800 shadow-lg">
                  {categoryView === 'create' ? 'Add Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    if (categoryView === 'delete') {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900">Delete Category?</h2>
                <p className="text-zinc-500 text-lg">Are you sure you want to delete <span className="text-zinc-900 font-bold">"{categoryToDelete?.name}"</span>?</p>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setCategoryView('list')} className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200">Cancel</button>
                <button onClick={() => categoryToDelete && deleteCategory(categoryToDelete.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg">Delete Permanently</button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-zinc-900">Categories Management</h2>
          <button onClick={() => { setSelectedCategory(null); setCategoryView('create'); }} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 shadow-lg">
            <Plus size={18} /> Add Category
          </button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Category</th>
                  <th className="pb-4 font-semibold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-zinc-900">{cat.name}</div>
                      <div className="text-xs text-zinc-500 line-clamp-1">{cat.description}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedCategory(cat); setCategoryView('edit'); }} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => { setCategoryToDelete(cat); setCategoryView('delete'); }} className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div>
      </div>
    );

    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'courses': return renderCourses();
      case 'categories': return renderCategories();
      case 'registrations': return renderRegistrations();
      case 'settings': return renderSettings();
      case 'team': return renderTeam();
      case 'services': return renderServices();
      case 'testimonials': return renderTestimonials();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:translate-x-0 ${!isSidebarOpen && 'lg:hidden'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
              <h1 className="text-xl font-bold tracking-tight">SURPLUS <span className="text-zinc-400 font-medium">ADMIN</span></h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-zinc-400 hover:text-zinc-900">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={BookOpen} label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
            <SidebarItem icon={Tags} label="Categories" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
            <SidebarItem icon={UserCheck} label="Registrations" active={activeTab === 'registrations'} onClick={() => setActiveTab('registrations')} />
            <SidebarItem icon={Users} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
            <SidebarItem icon={Briefcase} label="Services" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
            <SidebarItem icon={MessageSquare} label="Testimonials" active={activeTab === 'testimonials'} onClick={() => setActiveTab('testimonials')} />
            <div className="pt-4 mt-4 border-t border-zinc-100">
              <SidebarItem icon={SettingsIcon} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-zinc-900">Admin User</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Super Admin</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
