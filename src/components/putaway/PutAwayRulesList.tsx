
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Eye } from 'lucide-react';

export const PutAwayRulesList = () => {
  const { t } = useTranslation('putaway');

  // Datos de ejemplo para las reglas
  const sampleRules = [
    {
      id: '1',
      rule_name: 'Productos Frágiles',
      description: 'Productos frágiles van a estantes superiores',
      priority: 1,
      is_active: true,
      conditions: ['Categoría = Frágil'],
      suggested_location: 'Estante Superior'
    },
    {
      id: '2',
      rule_name: 'Productos Pesados',
      description: 'Productos pesados van a nivel del suelo',
      priority: 2,
      is_active: true,
      conditions: ['Peso > 10kg'],
      suggested_location: 'Nivel Suelo'
    },
    {
      id: '3',
      rule_name: 'Rotación FIFO',
      description: 'Productos con fecha de vencimiento usan FIFO',
      priority: 3,
      is_active: false,
      conditions: ['Tiene fecha de vencimiento'],
      suggested_location: 'Zona FIFO'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('rules.subtitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('rules.subtitle_desc')}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('rules.new_rule_button')}
        </Button>
      </div>

      <div className="grid gap-4">
        {sampleRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t('rules.priority')} {rule.priority}</Badge>
                  {rule.is_active ? (
                    <Badge variant="default">{t('rules.status_active')}</Badge>
                  ) : (
                    <Badge variant="secondary">{t('rules.status_inactive')}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">{t('rules.conditions')}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('rules.suggested_location')}:</h4>
                  <Badge variant="secondary">{rule.suggested_location}</Badge>
                </div>

                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    {t('rules.view_details_button')}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    {t('rules.edit_button')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
