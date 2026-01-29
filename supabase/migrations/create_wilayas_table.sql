-- 1. Create the Wilayas table
CREATE TABLE IF NOT EXISTS public.wilayas (
    id SERIAL PRIMARY KEY,
    name_ar TEXT,
    name_en TEXT NOT NULL
);

-- 2. Enable RLS (and allow public read access)
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.wilayas
    FOR SELECT USING (true);

-- 3. Insert the 58 Wilayas
INSERT INTO public.wilayas (id, name_en, name_ar) VALUES
(1, 'Adrar', 'أدرار'),
(2, 'Chlef', 'الشلف'),
(3, 'Laghouat', 'الأغواط'),
(4, 'Oum El Bouaghi', 'أم البواقي'),
(5, 'Batna', 'باتنة'),
(6, 'Béjaïa', 'بجاية'),
(7, 'Biskra', 'بسكرة'),
(8, 'Béchar', 'بشار'),
(9, 'Blida', 'البليدة'),
(10, 'Bouira', 'البويرة'),
(11, 'Tamanrasset', 'تمنراست'),
(12, 'Tébessa', 'تبسة'),
(13, 'Tlemcen', 'تلمسان'),
(14, 'Tiaret', 'تيارت'),
(15, 'Tizi Ouzou', 'تيزي وزو'),
(16, 'Algiers', 'الجزائر'),
(17, 'Djelfa', 'الجلفة'),
(18, 'Jijel', 'جيجل'),
(19, 'Sétif', 'سطيف'),
(20, 'Saïda', 'سعيدة'),
(21, 'Skikda', 'سكيكدة'),
(22, 'Sidi Bel Abbès', 'سيدي بلعباس'),
(23, 'Annaba', 'عنابة'),
(24, 'Guelma', 'قالمة'),
(25, 'Constantine', 'قسنطينة'),
(26, 'Médéa', 'المدية'),
(27, 'Mostaganem', 'مستغانم'),
(28, 'M''Sila', 'المسيلة'),
(29, 'Mascara', 'معسكر'),
(30, 'Ouargla', 'ورقلة'),
(31, 'Oran', 'وهران'),
(32, 'El Bayadh', 'البيض'),
(33, 'Illizi', 'إليزي'),
(34, 'Bordj Bou Arréridj', 'برج بوعريريج'),
(35, 'Boumerdès', 'بومرداس'),
(36, 'El Tarf', 'الطرف'),
(37, 'Tindouf', 'تندوف'),
(38, 'Tissemsilt', 'تيسمسيلت'),
(39, 'El Oued', 'الوادي'),
(40, 'Khenchela', 'خنشلة'),
(41, 'Souk Ahras', 'سوق أهراس'),
(42, 'Tipaza', 'تيبازة'),
(43, 'Mila', 'ميلة'),
(44, 'Aïn Defla', 'عين الدفلى'),
(45, 'Naâma', 'نعامة'),
(46, 'Aïn Témouchent', 'عين تموشنت'),
(47, 'Ghardaïa', 'غرداية'),
(48, 'Relizane', 'غليزان'),
(49, 'El M''Ghair', 'المغير'),
(50, 'El Meniaa', 'المنيعة'),
(51, 'Ouled Djellal', 'أولاد جلال'),
(52, 'Bordj Baji Mokhtar', 'برج باجي مختار'),
(53, 'Béni Abbès', 'بني عباس'),
(54, 'Timimoun', 'تيميمون'),
(55, 'Touggourt', 'تقرت'),
(56, 'Djanet', 'جانت'),
(57, 'In Salah', 'عين صالح'),
(58, 'In Guezzam', 'عين قزام')
ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar;

-- 4. Update Profiles Table
-- Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wilaya_id') THEN
        ALTER TABLE public.profiles ADD COLUMN wilaya_id INTEGER REFERENCES public.wilayas(id);
    END IF;
END $$;

-- 5. Migrate existing data (Optional Best Effort)
-- If there was a 'wilaya' text column, we could try to map it. 
-- Since the previous implementation used IDs stored as text (e.g. "16"), we can try to cast it.
-- BUT CAUTION: If 'wilaya' contains "Algiers", casting fails. 
-- Let's assume 'wilaya' column might be text but holds numbers as string (based on previous code analysis).
-- updating wilaya_id from wilaya (if wilaya is integer-like)

UPDATE public.profiles
SET wilaya_id = wilaya::INTEGER
WHERE wilaya_id IS NULL 
  AND wilaya ~ '^[0-9]+$'; -- Only update if string is purely numeric

-- 6. Grant Permissions
GRANT SELECT ON public.wilayas TO anon, authenticated, service_role;
