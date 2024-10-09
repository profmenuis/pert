// script.js
var svg = d3.select("svg");
var circleData = [];
var lineData = [];
var selectedCircles = [];  // Stocker les cercles sélectionnés pour la liaison
var selectedLine; // Ligne actuellement sélectionnée pour changer le style

// Définir un marqueur pour les flèches
svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "-0 -5 10 10")
    .attr("refX", 10) // Ajuster ici pour ancrer la flèche correctement
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("xoverflow", "visible")
    .append("svg:path")
    .attr("d", "M 0,-5 L 10 ,0 L 0,5") // Forme de la flèche
    .attr("fill", "#000")
    .style("stroke", "none");

// Fonction pour ajouter un nouveau cercle
function addCircle() {
    var number1 = prompt("Entrez temps au plus tot (en bas gauche) :", Math.floor(Math.random() * 10));
    var number2 = prompt("Entrez temps au plus tard (en bas droit) :", Math.floor(Math.random() * 10));
    var topNumber = prompt("Entrez le numero étape :", Math.floor(Math.random() * 10));

    var newCircle = {
        cx: Math.random() * 700 + 50, // Position aléatoire dans le SVG
        cy: Math.random() * 500 + 50,
        r: 30,
        color: "blue",
        id: circleData.length + 1,
        number1: +number1,
        number2: +number2,
        topNumber: +topNumber
    };
    circleData.push(newCircle);
    

    // Mettre à jour l'affichage des cercles et lignes
    updateDisplay();
}

// Fonction pour mettre à jour les cercles affichés
function updateDisplay() {
    var circles = svg.selectAll("g")
        .data(circleData, function(d) { return d.id; });

    // Entrée : ajouter des nouveaux cercles
    var gEnter = circles.enter()
        .append("g")
        .attr("class", "circle")
        .attr("transform", function(d) { return "translate(" + d.cx + "," + d.cy + ")"; })
        .on("click", function(event, d) {
            selectCircle(d);
        })
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    gEnter.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return d.color; })
        .style("stroke", "black")
        .style("stroke-width", 2);

    // Ajouter le nombre en haut (rendre éditable)
    gEnter.append("text")
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .style("fill", "white")
        .text(function(d) { return d.topNumber; })
        .on("click", function(event, d) {
            event.stopPropagation();
            var newText = prompt("Modifier le nombre en haut :", d.topNumber);
            if (newText !== null) {
                d.topNumber = +newText;
                d3.select(this).text(newText);
            }
        });

    // Ajouter les nombres côte à côte dans la partie basse (rendre éditable)
    gEnter.append("text")
        .attr("x", -15)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .style("fill", "white")
        .text(function(d) { return d.number1; })
        .on("click", function(event, d) {
            event.stopPropagation();
            var newText = prompt("Modifier le premier nombre :", d.number1);
            if (newText !== null) {
                d.number1 = +newText;
                d3.select(this).text(newText);
            }
        });

    gEnter.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .style("fill", "white")
        .text(function(d) { return d.number2; })
        .on("click", function(event, d) {
            event.stopPropagation();
            var newText = prompt("Modifier le deuxième nombre :", d.number2);
            if (newText !== null) {
                d.number2 = +newText;
                d3.select(this).text(newText);
            }
        });

    // Ajouter une icône de suppression
    gEnter.append("circle")
        .attr("class", "delete-icon")
        .attr("r", 5)
        .attr("cx", 20) // Position à droite du cercle
        .attr("cy", 20) // Position en bas à droite
        .on("click", function(event, d) {
            event.stopPropagation(); // Éviter de sélectionner le cercle en même temps
            deleteCircle(d.id); // Supprimer le cercle
        });

    circles.exit().remove();

    updateLines();
}

// Fonction pour supprimer un cercle et ses lignes associées
function deleteCircle(circleId) {
    circleData = circleData.filter(function(d) { return d.id !== circleId; });
    lineData = lineData.filter(function(d) {
        return d.circle1.id !== circleId && d.circle2.id !== circleId;
    });
    updateDisplay();
}

// Fonction pour mettre à jour les lignes entre les cercles
function updateLines() {
    var lines = svg.selectAll(".link")
        .data(lineData);

    var linesEnter = lines.enter()
        .append("g")
        .attr("class", "link")
        .each(function(d) {
            var line = d3.select(this)
                .append("line")
                .attr("stroke", d.color || "black")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#arrowhead)")
                .on("click", function(event) {
                    selectedLine = d; // Sauvegarder la ligne sélectionnée
                    openStyleDialog(selectedLine); // Ouvrir le dialogue pour changer le style
                });

            // Ajouter du texte pour la durée de la liaison
            d3.select(this)
                .append("text")
                .attr("x", (d.circle1.cx + d.circle2.cx) / 2) // Position au milieu
                .attr("y", (d.circle1.cy + d.circle2.cy) / 2 - 5) // Légèrement au-dessus de la ligne
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .style("fill", "black")
                .text(d.text)
                .on("click", function(event, d) {
                    event.stopPropagation(); // Éviter de sélectionner la ligne en même temps
                    var newText = prompt("Modifier la durée :", d.text);
                    if (newText !== null) {
                        d.text = newText;
                        d3.select(this).text(newText);
                    }
                });
        });

    lines.exit().remove();

    lines.each(function(d) {
        var edge = calculateEdge(d.circle1, d.circle2);
        d3.select(this).select("line")
            .attr("x1", edge.x1)
            .attr("y1", edge.y1)
            .attr("x2", edge.x2)
            .attr("y2", edge.y2);

        // Mettre à jour la position du texte
        d3.select(this).select("text")
            .attr("x", (edge.x1 + edge.x2) / 2)
            .attr("y", (edge.y1 + edge.y2) / 2 - 5) // Ajuster la position verticalement
            .text(d.text); // Mettre à jour le texte

        // Mettre à jour le style de la ligne en fonction du style choisi
        var lineElement = d3.select(this).select("line");
        if (d.style === "normal") {
            lineElement
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .style("stroke-dasharray", "none");
        } else if (d.style === "red") {
            lineElement
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .style("stroke-dasharray", "none");
        } else if (d.style === "dashed") {
            lineElement
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .style("stroke-dasharray", "5, 5"); // Ligne pointillée
        }
    });
}

// Calculer les coordonnées des lignes entre les cercles
function calculateEdge(circle1, circle2) {
    const angle = Math.atan2(circle2.cy - circle1.cy, circle2.cx - circle1.cx);
    const padding = 10; // Espacement entre la ligne et les cercles

    return {
        x1: circle1.cx + circle1.r * Math.cos(angle) + padding * Math.cos(angle),
        y1: circle1.cy + circle1.r * Math.sin(angle) + padding * Math.sin(angle),
        x2: circle2.cx - circle2.r * Math.cos(angle) - padding * Math.cos(angle),
        y2: circle2.cy - circle2.r * Math.sin(angle) - padding * Math.sin(angle)
    };
}

// Fonction pour sélectionner les cercles
function selectCircle(circle) {
    if (selectedCircles.includes(circle)) {
        selectedCircles = selectedCircles.filter(function(d) { return d !== circle; });
    } else {
        selectedCircles.push(circle);
    }

    if (selectedCircles.length == 2) {
        createLink(selectedCircles[0], selectedCircles[1]);
        selectedCircles = [];
    }
}

// Fonction pour créer une liaison entre les cercles
function createLink(circle1, circle2) {
    var lineText = prompt("Entrez la durée :");

    var newLine = { 
        circle1: circle1, 
        circle2: circle2, 
        text: lineText, 
        style: "normal", 
        color: "black" // Par défaut
    };

    lineData.push(newLine);
    updateLines();
}

// Fonction pour ouvrir la boîte de dialogue de sélection de style
function openStyleDialog(line) {
    selectedLine = line; // Sauvegarder la ligne sélectionnée
    document.getElementById("styleDialog").style.display = "block"; // Afficher la boîte de dialogue
    document.getElementById("lineStyle").value = selectedLine.style; // Sélectionner le style actuel
}

// Fonction pour appliquer le style sélectionné
function applyLineStyle() {
    const selectedStyle = document.getElementById("lineStyle").value;
    if (selectedLine) {
        selectedLine.style = selectedStyle; // Mettre à jour le style de la ligne
        // Définir la couleur selon le style
        if (selectedStyle === "normal") {
            selectedLine.color = "black";
        } else if (selectedStyle === "red") {
            selectedLine.color = "red";
        } else if (selectedStyle === "dashed") {
            selectedLine.color = "black"; // Pour le style pointillé, couleur par défaut
        }
        updateLines(); // Mettre à jour les lignes graphiquement
        closeStyleDialog(); // Fermer la boîte de dialogue
    }
}

// Fonction pour fermer la boîte de dialogue
function closeStyleDialog() {
    document.getElementById("styleDialog").style.display = "none"; // Masquer la boîte de dialogue
}

// Événements pour appliquer et annuler le style
document.getElementById("applyStyle").addEventListener("click", applyLineStyle);
document.getElementById("cancelStyle").addEventListener("click", closeStyleDialog);

// Fonctions de Drag & Drop pour les cercles
function dragStarted(event, d) {
    d3.select(this).raise().classed("active", true);
}

function dragged(event, d) {
    d.cx = event.x;
    d.cy = event.y;
    d3.select(this).attr("transform", "translate(" + d.cx + "," + d.cy + ")");
    updateLines();
}

function dragEnded(event, d) {
    d3.select(this).classed("active", false);
}

// Lancer l'ajout d'un cercle au clic sur le bouton
document.getElementById("addCircle").addEventListener("click", addCircle);
