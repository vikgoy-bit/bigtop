UPDATE public.protect_tiers SET monthly_fee_pence = 2000, sort_order = 20 WHERE cover_value_pence = 200000;
UPDATE public.protect_tiers SET label = 'Up to £4,000', cover_value_pence = 400000, monthly_fee_pence = 2600, sort_order = 30 WHERE cover_value_pence = 500000;
UPDATE public.protect_tiers SET label = 'Up to £7,500', cover_value_pence = 750000, monthly_fee_pence = 3600, sort_order = 40 WHERE cover_value_pence = 1000000;
UPDATE public.protect_tiers SET label = 'Up to £10,000', cover_value_pence = 1000000, monthly_fee_pence = 4800, sort_order = 50 WHERE cover_value_pence = 2000000;
INSERT INTO public.protect_tiers (label, cover_value_pence, monthly_fee_pence, sort_order) VALUES ('Up to £15,000', 1500000, 6000, 60);
UPDATE public.protect_tiers SET sort_order = 100 WHERE cover_value_pence = 0;