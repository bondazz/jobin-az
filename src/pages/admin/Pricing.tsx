import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { 
  Save,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  Star,
  Crown,
  Zap,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  icon: string;
  is_popular: boolean;
  display_order: number;
  is_active: boolean;
}

interface PricingFeature {
  id: string;
  category: string;
  feature_name: string;
  basic_plan: boolean;
  premium_plan: boolean;
  enterprise_plan: boolean;
  display_order: number;
  is_active: boolean;
}

const iconOptions = [
  { value: 'Star', label: 'Ulduz', icon: Star },
  { value: 'Crown', label: 'Tac', icon: Crown },
  { value: 'Zap', label: 'İldırım', icon: Zap },
  { value: 'DollarSign', label: 'Dollar', icon: DollarSign }
];

export default function AdminPricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [features, setFeatures] = useState<PricingFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingFeature, setEditingFeature] = useState<PricingFeature | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    period: 'ay',
    features: [''],
    icon: 'Star',
    is_popular: false,
    display_order: 0
  });
  const [featureForm, setFeatureForm] = useState({
    category: '',
    feature_name: '',
    basic_plan: false,
    premium_plan: false,
    enterprise_plan: false,
    display_order: 0
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchPricingData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
  };

  const fetchPricingData = async () => {
    try {
      const [plansResponse, featuresResponse] = await Promise.all([
        supabase
          .from('pricing_plans')
          .select('*')
          .order('display_order'),
        supabase
          .from('pricing_features')
          .select('*')
          .order('category, display_order')
      ]);

      if (plansResponse.error) throw plansResponse.error;
      if (featuresResponse.error) throw featuresResponse.error;

      setPlans(plansResponse.data || []);
      setFeatures(featuresResponse.data || []);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: "Xəta",
        description: "Qiymət məlumatlarını yükləyərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      const planData = {
        ...planForm,
        features: planForm.features.filter(f => f.trim() !== ''),
        display_order: editingPlan ? editingPlan.display_order : plans.length
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pricing_plans')
          .insert([planData]);

        if (error) throw error;
      }

      toast({
        title: "Uğurlu",
        description: `Plan ${editingPlan ? 'yeniləndi' : 'əlavə edildi'}`,
      });

      setShowPlanDialog(false);
      resetPlanForm();
      fetchPricingData();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Xəta",
        description: "Plan saxlanılarkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };

  const handleSaveFeature = async () => {
    try {
      const featureData = {
        ...featureForm,
        display_order: editingFeature ? editingFeature.display_order : features.length
      };

      if (editingFeature) {
        const { error } = await supabase
          .from('pricing_features')
          .update(featureData)
          .eq('id', editingFeature.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pricing_features')
          .insert([featureData]);

        if (error) throw error;
      }

      toast({
        title: "Uğurlu",
        description: `Xüsusiyyət ${editingFeature ? 'yeniləndi' : 'əlavə edildi'}`,
      });

      setShowFeatureDialog(false);
      resetFeatureForm();
      fetchPricingData();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast({
        title: "Xəta",
        description: "Xüsusiyyət saxlanılarkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Bu planı silmək istədiyinizdən əminsiniz?')) return;

    try {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Uğurlu",
        description: "Plan silindi",
      });

      fetchPricingData();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Xəta",
        description: "Plan silinərkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Bu xüsusiyyəti silmək istədiyinizdən əminsiniz?')) return;

    try {
      const { error } = await supabase
        .from('pricing_features')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Uğurlu",
        description: "Xüsusiyyət silindi",
      });

      fetchPricingData();
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast({
        title: "Xəta",
        description: "Xüsusiyyət silinərkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      period: plan.period,
      features: plan.features || [''],
      icon: plan.icon,
      is_popular: plan.is_popular,
      display_order: plan.display_order
    });
    setShowPlanDialog(true);
  };

  const handleEditFeature = (feature: PricingFeature) => {
    setEditingFeature(feature);
    setFeatureForm({
      category: feature.category,
      feature_name: feature.feature_name,
      basic_plan: feature.basic_plan,
      premium_plan: feature.premium_plan,
      enterprise_plan: feature.enterprise_plan,
      display_order: feature.display_order
    });
    setShowFeatureDialog(true);
  };

  const resetPlanForm = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      description: '',
      price: '',
      period: 'ay',
      features: [''],
      icon: 'Star',
      is_popular: false,
      display_order: 0
    });
  };

  const resetFeatureForm = () => {
    setEditingFeature(null);
    setFeatureForm({
      category: '',
      feature_name: '',
      basic_plan: false,
      premium_plan: false,
      enterprise_plan: false,
      display_order: 0
    });
  };

  const addFeatureInput = () => {
    setPlanForm({
      ...planForm,
      features: [...planForm.features, '']
    });
  };

  const removeFeatureInput = (index: number) => {
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm({
      ...planForm,
      features: newFeatures.length > 0 ? newFeatures : ['']
    });
  };

  const updateFeatureInput = (index: number, value: string) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm({
      ...planForm,
      features: newFeatures
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Qiymət Planları</h1>
            <p className="text-muted-foreground">Qiymət planlarını və xüsusiyyətlərini idarə edin</p>
          </div>
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Planlar</TabsTrigger>
            <TabsTrigger value="features">Xüsusiyyətlər</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetPlanForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPlan ? 'Planı Redaktə Et' : 'Yeni Plan Əlavə Et'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Plan Adı</Label>
                        <Input
                          id="name"
                          value={planForm.name}
                          onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                          placeholder="Premium Plan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Qiymət</Label>
                        <Input
                          id="price"
                          value={planForm.price}
                          onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                          placeholder="25"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="period">Dövr</Label>
                        <Select value={planForm.period} onValueChange={(value) => setPlanForm({...planForm, period: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ay">Ay</SelectItem>
                            <SelectItem value="il">İl</SelectItem>
                            <SelectItem value="həftə">Həftə</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="icon">İkon</Label>
                        <Select value={planForm.icon} onValueChange={(value) => setPlanForm({...planForm, icon: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className="h-4 w-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Təsvir</Label>
                      <Textarea
                        id="description"
                        value={planForm.description}
                        onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                        placeholder="Plan təsviri"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_popular"
                        checked={planForm.is_popular}
                        onCheckedChange={(checked) => setPlanForm({...planForm, is_popular: checked})}
                      />
                      <Label htmlFor="is_popular">Populyar Plan</Label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Xüsusiyyətlər</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addFeatureInput}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {planForm.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={feature}
                              onChange={(e) => updateFeatureInput(index, e.target.value)}
                              placeholder={`Xüsusiyyət ${index + 1}`}
                            />
                            {planForm.features.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFeatureInput(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
                        Ləğv et
                      </Button>
                      <Button onClick={handleSavePlan}>
                        <Save className="mr-2 h-4 w-4" />
                        Saxla
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.is_popular && (
                            <Badge variant="default" className="bg-primary">
                              Populyar
                            </Badge>
                          )}
                          {!plan.is_active && (
                            <Badge variant="outline">
                              Deaktiv
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{plan.price} AZN</span>
                        <span className="text-muted-foreground">/ {plan.period}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Xüsusiyyətlər:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {plan.features?.slice(0, 3).map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                          {plan.features && plan.features.length > 3 && (
                            <li className="text-primary">+{plan.features.length - 3} daha</li>
                          )}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetFeatureForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Xüsusiyyət
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingFeature ? 'Xüsusiyyəti Redaktə Et' : 'Yeni Xüsusiyyət Əlavə Et'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Kateqoriya</Label>
                      <Input
                        id="category"
                        value={featureForm.category}
                        onChange={(e) => setFeatureForm({...featureForm, category: e.target.value})}
                        placeholder="Əsas Xüsusiyyətlər"
                      />
                    </div>

                    <div>
                      <Label htmlFor="feature_name">Xüsusiyyət Adı</Label>
                      <Input
                        id="feature_name"
                        value={featureForm.feature_name}
                        onChange={(e) => setFeatureForm({...featureForm, feature_name: e.target.value})}
                        placeholder="Limitsiz vakansiya yerləşdirmə"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Planlar</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="basic_plan"
                            checked={featureForm.basic_plan}
                            onCheckedChange={(checked) => setFeatureForm({...featureForm, basic_plan: checked})}
                          />
                          <Label htmlFor="basic_plan">Əsas Plan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="premium_plan"
                            checked={featureForm.premium_plan}
                            onCheckedChange={(checked) => setFeatureForm({...featureForm, premium_plan: checked})}
                          />
                          <Label htmlFor="premium_plan">Premium Plan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enterprise_plan"
                            checked={featureForm.enterprise_plan}
                            onCheckedChange={(checked) => setFeatureForm({...featureForm, enterprise_plan: checked})}
                          />
                          <Label htmlFor="enterprise_plan">Şirkət Planı</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
                        Ləğv et
                      </Button>
                      <Button onClick={handleSaveFeature}>
                        <Save className="mr-2 h-4 w-4" />
                        Saxla
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Xüsusiyyətlər Siyahısı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div key={feature.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{feature.feature_name}</h4>
                          <p className="text-sm text-muted-foreground">{feature.category}</p>
                          <div className="flex gap-2 mt-2">
                            {feature.basic_plan && <Badge variant="outline">Əsas</Badge>}
                            {feature.premium_plan && <Badge variant="default">Premium</Badge>}
                            {feature.enterprise_plan && <Badge variant="secondary">Şirkət</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditFeature(feature)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}