const API_BASE = import.meta.env.VITE_INVENTORY_API || 'http://localhost:3004';

export interface BranchInventory {
  branchCode: string;
  availableQuantity: number;
}

export interface LensInventory {
  lensId: string;
  branches: BranchInventory[];
}

export async function fetchInventory(lensId: string) {
  if (!lensId) throw new Error('Lens ID is required');
  const response = await fetch(`${API_BASE}/api/inventory/lenses/${lensId}`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  const data = await response.json();
  // backend returns an array of branch objects; normalize to LensInventory
  if (Array.isArray(data)) {
    return {
      lensId,
      branches: data as BranchInventory[],
    } as LensInventory;
  }
  return data as LensInventory;
}