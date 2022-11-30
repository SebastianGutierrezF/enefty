import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Articulo } from '../interfaces/articulo';
import { Comentario } from '../interfaces/comentario';
import { DataService } from '../services/data.service';
import { MatMenuModule } from '@angular/material/menu';
import { Oferta } from '../interfaces/oferta';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedNft?: Articulo;
  comentarios?: any[];
  comXCat?: any[] = [];
  comInput: FormGroup = this.fb.group({
    com: [, [Validators.required, Validators.maxLength(254)]],
    ida_com: [, Validators.required],
    idu_com: [, Validators.required]
  })
  modal = false;
  Productos: any = [] ;
  ProductosxCategoria: any = [] ;
  Categorias: any = [] ;
  categoria: any;
  productosTodos: any;
  ofertas: string[] = [];
  comCatSelected?: number;

  constructor(
    private ds: DataService,
    private fb: FormBuilder
  ) {
    this.ObtenerProductos('todos');
    this.ObtenerCategorias();
    this.obtenerComentarios();
    this.obtenerOfertas();
    this.ds.getPrice();
  }

  ngOnInit(): void {
  }

  obtenerOfertas() {
    this.ds.get('oferta', 'obtenerOfertas').subscribe((data: any) => {
      if (data) {
        let desc: number = 0;
        const hoy = new Date(Date.now());
        data.forEach((oferta: any) => {
          if (new Date(oferta.fechain_o) <= hoy && new Date(oferta.fechafin_o) >= hoy) {
            desc += Number.parseInt(oferta.desc_o);
            this.ofertas.push(oferta.banner_o);
          }
        });        
        localStorage.setItem('desc_o', desc.toString());
      } else {
        alert("Ocurrio un error al intentar obtener ofertas");
      }
    })
  }

  ObtenerProductos(categoria: any) {
    this.categoria = categoria;
    this.ds.get('articulo', 'obtenerProductos').subscribe((dato: any) => {
      this.Productos = dato.reverse();
      this.productosTodos = dato;
    });
  }

  ObtenerProductosxCategoria(categoria: any, id: any) {
    this.categoria = categoria;
    this.ds.post('articulo', 'obtenerProductosxCategoria', {'idcat_a': id}).subscribe((dato: any) => {
      this.Productos = dato.reverse();
    });
  }

  ObtenerCategorias() {
    this.ds.get('categoria', 'traerCategorias').subscribe((dato: any) => {
      this.Categorias = dato;
    });
  }

  obtenerComentarios() {
    this.ds.get('comentario', 'obtenerComentarios').subscribe((dato: any) => {
      // this.comentarios = dato.reverse();
      this.comXCat = dato.reverse();
    });
  }

  comentarioPorNft(id_a: number) {
    this.ds.post('comentario', 'comentariosXNft', {id_a: id_a}).subscribe((dato: any) => {
      if (dato) {
        this.comentarios = dato.reverse();
      }
    });
  }

  comentariosPorCat(event: any) {
    if (event.target.value == '0') {
      this.obtenerComentarios();
    } else {
      this.ds.post('comentario', 'comentariosXCategoria', {id_c: event.target.value}).subscribe((data: any) => {
        if (data) {
          this.comXCat = data.reverse();
        }
      })
    }
  }

  agregarAlCarrito(data: any) {

    if(localStorage.getItem('carrito')){

      var localCarrito = JSON.parse(localStorage.getItem('carrito')!);
      localCarrito.push({ "id_a": data.id_a, "nombre_a": data.nombre_a, "precio_a": data.precio_a, "img_a": data.img_a});

      localStorage.setItem('carrito',JSON.stringify(localCarrito));

    }else{

      localStorage.setItem('carrito', JSON.stringify([{ "id_a": data.id_a, "nombre_a": data.nombre_a, "precio_a": data.precio_a, "img_a": data.img_a}]));

    }
  }

  abrirModal(nft: Articulo) {
    this.selectedNft = nft;
    this.comentarioPorNft(this.selectedNft.id_a);
    this.comInput.patchValue({
      ida_com: this.selectedNft.id_a,
      // idu_com: localStorage.getItem('id_u')
      idu_com: 1
    })
    this.modal = true;
  }

  cerrarModal() {
    this.selectedNft = undefined;
    this.comentarios = [];
    this.modal = false;
  }

  insertarComentario() {
    this.ds.post('comentario', 'insertarComentario', this.comInput.value).subscribe((data: any) => {
      if (data) {
        this.comentarioPorNft(this.selectedNft!.id_a);
        this.obtenerComentarios();
        this.comInput.controls['com'].reset();
      } else {
        alert("Ocurrio un error al agregar el comentario");
      }
    })
  }


}
