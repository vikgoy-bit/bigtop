
ALTER TABLE public.protect_tiers
  ADD COLUMN IF NOT EXISTS storeganise_product_id text;

-- Update existing rows in place (preserves bookings FK)
UPDATE public.protect_tiers SET label='Up to £4,000',  cover_value_pence=400000,  monthly_fee_pence=600,  sort_order=10,  storeganise_product_id='69cbe8ae6eb959625fa9c7a3' WHERE id='2826d2fb-d316-423e-b648-756e551eda40';
UPDATE public.protect_tiers SET label='Up to £4,000 (legacy)', cover_value_pence=400000, monthly_fee_pence=600, sort_order=15, storeganise_product_id='69cbe8ae6eb959625fa9c7a3' WHERE id='fef96920-89da-4a77-9527-9cfbe6f5bb84';
UPDATE public.protect_tiers SET label='Up to £7,500',  cover_value_pence=750000,  monthly_fee_pence=1600, sort_order=20, storeganise_product_id='69cbe8d26eb959625faa2dac' WHERE id='c756edf7-09c8-4615-9a28-b3fbdd3f7c17';
UPDATE public.protect_tiers SET label='Up to £10,000', cover_value_pence=1000000, monthly_fee_pence=2800, sort_order=30, storeganise_product_id='69cbe9066eb959625faa7611' WHERE id='d3a49e78-f794-4d81-8d6e-972608fba306';
UPDATE public.protect_tiers SET label='Up to £15,000', cover_value_pence=1500000, monthly_fee_pence=4000, sort_order=40, storeganise_product_id='69cbe9416eb959625faa9f62' WHERE id='b607c965-0861-4f64-a721-c16b4e56ab72';
UPDATE public.protect_tiers SET label='I have my own cover', cover_value_pence=0, monthly_fee_pence=0, sort_order=100, storeganise_product_id='69cfd9459d6f68cca79a1b22' WHERE id='0374bcb1-a43f-4266-aff7-fa9cd88ad110';

-- Hide the legacy duplicate by setting sort_order high; safe-delete only if unused
DELETE FROM public.protect_tiers
  WHERE id='fef96920-89da-4a77-9527-9cfbe6f5bb84'
  AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE protect_tier_id='fef96920-89da-4a77-9527-9cfbe6f5bb84');
