insert into story(id,title,slug,excerpt,content,author,image,category,created_at,status,published_slug) values('b1','The place we carry with us','the-place-we-carry-with-us','Some connections don’t need a map. They live in the lanes, faces, and little moments we remember.','There are places we visit, and places that quietly become a part of us. Home often belongs to the second kind. It is a familiar turn in the road, a roof seen through the trees, or a face that needs no introduction.

Looking at Gautiyan Tola from above, we see houses, fields and paths. Looking a little closer, we find the everyday connections that give those places meaning. A village is made as much of its people and their memories as it is of its buildings.

This journal is an invitation to keep those connections alive. Share a memory in your own words. Tell us about a place you love, a person who taught you something, or an ordinary day that stayed with you.

We do not need extraordinary stories to remember where we come from. Sometimes the simplest ones bring us home.','The Village Journal','/media/village-2.jpg','Belonging','2026-09-27 00:00:00','PUBLISHED','the-place-we-carry-with-us');
insert into story(id,title,slug,excerpt,content,author,image,category,created_at,status,published_slug) values('b2','A moment by the pond','a-moment-by-the-pond','Water, sky, and a familiar view. Finding beauty in the places we sometimes walk past.','A photograph of the village pond offers a reason to slow down. The sky reflects in the water, trees line the edge, and a familiar temple stands beyond it. Nothing in the picture asks us to hurry.

Everyday places can hold extraordinary meaning. We return to them over the years and see something different each time: a changing season, a new reflection, a memory of someone who once stood beside us.

The community photographs on this website are a small record of those places. They invite us to look again, to notice the details, and to share what these surroundings mean to us.

Do you have a memory of the pond? Your story could be the next one in our village journal.','The Village Journal','/media/village-4.jpg','Everyday life','2026-09-26 00:00:00','PUBLISHED','a-moment-by-the-pond');
insert into story(id,title,slug,excerpt,content,author,image,category,created_at,status,published_slug) values('b3','Memories are made together','memories-made-together','The moments that stay with us are often the ones we share. An invitation to tell your story.','The community footage shows people gathering beside the temple and pond. Each person brings a different connection to the place, but for a moment they share the same scene.

A gathering becomes a memory through the people who were there. Photographs show us what happened in a frame; personal stories help us understand how it felt. Both are worth preserving.

This website is a starting point for that shared collection. You can send a story, suggest a caption, or share a photograph with the community administrator. Reviewed contributions can then become part of the public journal.

What is a village moment you would like the next generation to remember? Start there. We would love to hear it.','The Village Journal','/media/village-1.jpg','Community','2026-09-25 00:00:00','PUBLISHED','memories-made-together');
insert into community_message(id,message,author_of_message,created_at) values('welcome-1','Wherever life takes us, there is something special about the place we call home.','A note from the village journal','2026-09-27 09:00:00');
insert into community_message(id,message,author_of_message,created_at) values('welcome-2','A photograph preserves a moment. A shared story keeps its meaning alive. Let’s keep both close.','A note from the village journal','2026-09-26 09:00:00');
insert into community_message(id,message,author_of_message,created_at) values('welcome-3','This space belongs to every generation. Bring your memories, your ideas, and your own little piece of home.','A note from the village journal','2026-09-25 09:00:00');
update story set date_only=true where id in ('b1','b2','b3');
