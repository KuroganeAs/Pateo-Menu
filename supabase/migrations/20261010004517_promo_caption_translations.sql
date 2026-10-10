-- Poster captions in Portuguese and Tetun, like the menu's *_pt / *_tet
-- fields. Empty = visitors see the English caption for that language.
alter table public.promos
  add column caption_pt text,
  add column caption_tet text;
