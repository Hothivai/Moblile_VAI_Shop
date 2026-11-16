import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import type { Category } from '../database/database';

type CategorySelectorProps = {
  categories: Category[];
  selectedId: number;
  onSelect: (categoryId: number) => void;
};

export default function CategorySelector({
  categories,
  selectedId,
  onSelect,
}: CategorySelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityLabel="Danh mục sản phẩm"
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(category.id)}
            style={({ pressed }) => [
              styles.categoryButton,
              isSelected && styles.selectedButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text
              style={[
                styles.categoryLabel,
                isSelected && styles.selectedLabel,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e8ecf4',
  },
  selectedButton: {
    backgroundColor: '#1769aa',
  },
  pressedButton: {
    opacity: 0.75,
  },
  categoryLabel: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLabel: {
    color: '#fff',
  },
});
