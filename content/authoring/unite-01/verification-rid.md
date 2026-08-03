# Contre-vérification orthographique au dictionnaire royal (RID)

- Date : 3 août 2026
- Source : Royal Institute Dictionary 2554, Office of the Royal Society,
  dictionary.orst.go.th
- Portée : les 45 graphies thaïes enseignées dans l'unité 1
- Nature du contrôle : **présence de la graphie comme entrée du
  dictionnaire normatif**. Ce contrôle ne porte ni sur le sens enseigné ni
  sur le ton : ceux-ci restent couverts par la chaîne à deux sources et par
  le contre-audit adversarial.

## Méthode

Le formulaire du RID interroge `func_lookup.php` en POST
(`word`, `funcName=lookupWord`, `status=lookup`) et renvoie les entrées
correspondantes. Une requête par mot, espacées de 1,2 seconde, avec un
agent utilisateur identifiant le projet et l'objet du contrôle.

Seules la présence et la forme des entrées sont conservées. **Aucune
définition n'est stockée, copiée ni redistribuée**, conformément à la
politique de sources.

Deux pièges rencontrés et corrigés, qui invalidaient les premiers relevés :

1. Le paramètre `search` de l'URL publique ne déclenche aucune recherche
   côté serveur, et le message « ไม่พบคำศัพท์ที่ต้องการค้นหา » est un bloc
   masqué présent sur **toutes** les pages. Un premier test l'avait pris
   pour une preuve d'absence : ce relevé était nul et non avenu.
2. Un titre d'entrée groupe parfois plusieurs vedettes séparées par des
   virgules (« สวัสดิ-, สวัสดิ์ ๑, สวัสดี ๑ »), et un tiret de tête ou de
   queue marque une forme liée. Sans découpage, สวัสดี et ขอบคุณ
   apparaissaient à tort comme absents.

## Résultat

| Statut                          | Nombre |
| ------------------------------- | ------ |
| Attestées comme entrée autonome | 44     |
| Absentes                        | 1      |
| Erreurs de requête              | 0      |

**Les 44 mots** de l'unité 1 sont attestés comme entrées autonomes du
dictionnaire normatif, dans la graphie exacte enseignée, séquence Unicode
NFC comprise.

### Le cas แล้วเจอกัน

Cette locution n'a pas d'entrée au RID, ce qui est attendu : un
dictionnaire ne liste pas les locutions libres. Ses trois composants sont
en revanche attestés chacun comme entrée autonome : แล้ว, เจอ et กัน.

La graphie de la locution est donc conforme à celle de ses composants,
mais **son emploi comme formule de séparation courante reste appuyé sur
Wiktionary et Volubilis**, pas sur le RID. Cette limite est consignée dans
le dossier de production de la leçon 1E.

## Ce que cette porte ne couvre pas

- Le **sens** enseigné pour chaque mot : chaîne à deux sources.
- Le **ton** et la longueur vocalique : chaîne à deux sources et audit.
- La **naturalité** et le registre en thaï contemporain : audit, et
  surtout revue par un locuteur natif, toujours **en attente**.

La mention « Revue native : en attente » reste donc affichée partout.
