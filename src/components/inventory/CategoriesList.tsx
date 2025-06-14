
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag } from 'lucide-react';

export const CategoriesList = () => {
  const { t } = useTranslation('inventory');
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            {t('categories.loadingError')}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            {t('categories.noCategories')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{category.code}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-500" />
                {category.is_active ? (
                  <Badge variant="default">{t('categories.active')}</Badge>
                ) : (
                  <Badge variant="secondary">{t('categories.inactive')}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          {category.description && (
            <CardContent>
              <div className="text-sm text-gray-600">
                {category.description}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
